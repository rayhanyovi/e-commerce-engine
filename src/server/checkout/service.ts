import { Prisma } from "@prisma/client";

import {
  type CheckoutPreviewDto,
  type CheckoutPreviewRejectedVoucher,
  type CheckoutPreviewResult,
  StoreConfigKeys,
  ErrorCodes,
} from "@/shared/contracts";
import {
  calculateDiscount,
  calculateShipping,
  getEffectivePrice,
  isPromotionEligible,
} from "@/server/domain";
import { prisma } from "@/server/db";
import { AppError } from "@/server/http";
import type { CartIdentity } from "@/server/cart";
import {
  getStoreConfigBooleanValue,
  getStoreConfigNumberValue,
  getStoreConfigSnapshot,
} from "@/server/store-config";

const checkoutCartInclude = {
  items: {
    orderBy: {
      id: "asc",
    },
    include: {
      product: {
        select: {
          id: true,
          categoryId: true,
          name: true,
          basePrice: true,
          promoPrice: true,
          isActive: true,
        },
      },
      variant: {
        include: {
          reservations: {
            where: {
              status: "ACTIVE",
            },
            select: {
              qty: true,
            },
          },
          optionCombination: {
            include: {
              optionValue: {
                include: {
                  optionDefinition: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

type CheckoutCart = Prisma.CartGetPayload<{
  include: typeof checkoutCartInclude;
}>;

function getCartWhere(identity: CartIdentity): Prisma.CartWhereInput {
  if (identity.userId) {
    return {
      userId: identity.userId,
    };
  }

  if (identity.guestToken) {
    return {
      guestToken: identity.guestToken,
    };
  }

  throw new AppError(
    400,
    ErrorCodes.VALIDATION_ERROR,
    "Checkout preview requires an active cart identity",
  );
}

function formatVariantLabel(
  optionCombination: CheckoutCart["items"][number]["variant"]["optionCombination"],
  sku: string | null,
) {
  if (!optionCombination.length) {
    return sku || "";
  }

  return optionCombination
    .map(
      (option) => `${option.optionValue.optionDefinition.name}: ${option.optionValue.value}`,
    )
    .join(", ");
}

function getAvailableQty(
  reservations: Array<{
    qty: number;
  }>,
  stockOnHand: number,
) {
  const activeReservations = reservations.reduce(
    (sum, reservation) => sum + reservation.qty,
    0,
  );

  return Math.max(0, stockOnHand - activeReservations);
}

function isPromotionApplicableToCart(
  promotion: {
    scopes: Array<{
      scopeType: "ALL_PRODUCTS" | "CATEGORY" | "PRODUCT" | "VARIANT";
      targetId: string | null;
    }>;
  },
  cart: CheckoutCart,
) {
  if (!promotion.scopes.length) {
    return true;
  }

  return promotion.scopes.some((scope) => {
    switch (scope.scopeType) {
      case "ALL_PRODUCTS":
        return true;

      case "CATEGORY":
        return cart.items.some((item) => item.product.categoryId === scope.targetId);

      case "PRODUCT":
        return cart.items.some((item) => item.productId === scope.targetId);

      case "VARIANT":
        return cart.items.some((item) => item.productVariantId === scope.targetId);

      default:
        return false;
    }
  });
}

async function loadActiveCart(identity: CartIdentity) {
  const cart = await prisma.cart.findFirst({
    where: {
      ...getCartWhere(identity),
      status: "ACTIVE",
    },
    include: checkoutCartInclude,
  });

  if (!cart || !cart.items.length) {
    throw new AppError(400, ErrorCodes.VALIDATION_ERROR, "Cart is empty");
  }

  const invalidItem = cart.items.find((item) => {
    const availableQty = getAvailableQty(item.variant.reservations, item.variant.stockOnHand);

    return !item.product.isActive || !item.variant.isActive || availableQty < item.qty;
  });

  if (invalidItem) {
    throw new AppError(
      400,
      ErrorCodes.VALIDATION_ERROR,
      "Cart contains inactive items or quantities that exceed current stock",
      {
        cartItemId: invalidItem.id,
      },
    );
  }

  return cart;
}

async function validateVoucherCodes(
  cart: CheckoutCart,
  subtotal: number,
  productDiscountTotal: number,
  userId: string | undefined,
  dto: CheckoutPreviewDto,
) {
  const normalizedCodes = Array.from(
    new Set(dto.voucherCodes.map((code) => code.trim()).filter(Boolean)),
  );

  if (!normalizedCodes.length) {
    return {
      appliedVouchers: [],
      rejectedVouchers: [],
      voucherDiscountTotal: 0,
      hasFreeShippingVoucher: false,
    };
  }

  const configSnapshot = await getStoreConfigSnapshot([
    StoreConfigKeys.MAX_VOUCHERS_PER_ORDER,
    StoreConfigKeys.ALLOW_VOUCHER_STACKING,
    StoreConfigKeys.ALLOW_VOUCHER_WITH_PRODUCT_DISCOUNT,
  ]);
  const maxVouchersPerOrder = getStoreConfigNumberValue(
    configSnapshot,
    StoreConfigKeys.MAX_VOUCHERS_PER_ORDER,
    1,
  );
  const allowVoucherStacking = getStoreConfigBooleanValue(
    configSnapshot,
    StoreConfigKeys.ALLOW_VOUCHER_STACKING,
    false,
  );
  const allowVoucherWithProductDiscount = getStoreConfigBooleanValue(
    configSnapshot,
    StoreConfigKeys.ALLOW_VOUCHER_WITH_PRODUCT_DISCOUNT,
    true,
  );
  const acceptedCodes = normalizedCodes.slice(
    0,
    allowVoucherStacking ? Math.max(1, maxVouchersPerOrder) : 1,
  );
  const ignoredCodes = normalizedCodes.slice(acceptedCodes.length);
  const promotions = await prisma.promotion.findMany({
    where: {
      code: {
        in: acceptedCodes,
      },
    },
    include: {
      scopes: true,
      usages: {
        select: {
          userId: true,
        },
      },
    },
  });
  const promotionMap = new Map(
    promotions
      .filter((promotion) => promotion.code)
      .map((promotion) => [promotion.code as string, promotion]),
  );
  const rejectedVouchers: CheckoutPreviewRejectedVoucher[] = ignoredCodes.map((code) => ({
    code,
    reason: allowVoucherStacking
      ? "Maximum voucher limit reached for one order"
      : "Voucher stacking is disabled for this store",
  }));
  const appliedVouchers: CheckoutPreviewResult["appliedVouchers"] = [];
  let voucherDiscountTotal = 0;
  let hasFreeShippingVoucher = false;

  for (const code of acceptedCodes) {
    const promotion = promotionMap.get(code);

    if (!promotion) {
      rejectedVouchers.push({
        code,
        reason: "Voucher not found",
      });
      continue;
    }

    const userUsageCount = userId
      ? promotion.usages.filter((usage) => usage.userId === userId).length
      : 0;
    const eligibility = isPromotionEligible(
      {
        ...promotion,
        scopes: promotion.scopes,
      },
      new Date(),
      userUsageCount,
    );

    if (!eligibility.eligible) {
      rejectedVouchers.push({
        code,
        reason: eligibility.reason ?? "Voucher is not eligible",
      });
      continue;
    }

    if (!isPromotionApplicableToCart(promotion, cart)) {
      rejectedVouchers.push({
        code,
        reason: "Voucher does not match the current cart scope",
      });
      continue;
    }

    if (promotion.minPurchase != null && subtotal < promotion.minPurchase) {
      rejectedVouchers.push({
        code,
        reason: `Minimum purchase is ${promotion.minPurchase}`,
      });
      continue;
    }

    if (!allowVoucherWithProductDiscount && productDiscountTotal > 0) {
      rejectedVouchers.push({
        code,
        reason: "Voucher cannot be combined with product discount",
      });
      continue;
    }

    const discount = calculateDiscount(
      {
        ...promotion,
        scopes: promotion.scopes,
      },
      subtotal,
    );

    appliedVouchers.push({
      code,
      discount,
      type: promotion.type,
    });
    voucherDiscountTotal += discount;
    hasFreeShippingVoucher = hasFreeShippingVoucher || promotion.type === "FREE_SHIPPING";
  }

  return {
    appliedVouchers,
    rejectedVouchers,
    voucherDiscountTotal,
    hasFreeShippingVoucher,
  };
}

export async function getCheckoutPreview(
  identity: CartIdentity,
  dto: CheckoutPreviewDto,
): Promise<CheckoutPreviewResult> {
  const cart = await loadActiveCart(identity);
  const configSnapshot = await getStoreConfigSnapshot([
    StoreConfigKeys.ALLOW_GUEST_CHECKOUT,
    StoreConfigKeys.FREE_SHIPPING_THRESHOLD,
    StoreConfigKeys.INTERNAL_FLAT_SHIPPING_COST,
    StoreConfigKeys.INTERNAL_FLAT_SHIPPING_ETA_DAYS,
  ]);
  const items = cart.items.map((item) => {
    const unitPrice = getEffectivePrice(item.product, item.variant);

    return {
      productId: item.productId,
      productVariantId: item.productVariantId,
      productName: item.product.name,
      variantLabel: formatVariantLabel(item.variant.optionCombination, item.variant.sku),
      unitPrice,
      qty: item.qty,
      lineSubtotal: unitPrice * item.qty,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const productDiscountTotal = cart.items.reduce((sum, item) => {
    const effectivePrice = getEffectivePrice(item.product, item.variant);
    const lineDiscount = Math.max(0, item.product.basePrice - effectivePrice);

    return sum + lineDiscount * item.qty;
  }, 0);
  const { appliedVouchers, rejectedVouchers, voucherDiscountTotal, hasFreeShippingVoucher } =
    await validateVoucherCodes(cart, subtotal, productDiscountTotal, identity.userId, dto);
  const shippingEtaDays = getStoreConfigNumberValue(
    configSnapshot,
    StoreConfigKeys.INTERNAL_FLAT_SHIPPING_ETA_DAYS,
    2,
  );
  const shipping = calculateShipping(
    {
      subtotalAfterDiscount: Math.max(0, subtotal - voucherDiscountTotal),
      freeShippingThreshold: getStoreConfigNumberValue(
        configSnapshot,
        StoreConfigKeys.FREE_SHIPPING_THRESHOLD,
        500000,
      ),
      flatShippingCost: getStoreConfigNumberValue(
        configSnapshot,
        StoreConfigKeys.INTERNAL_FLAT_SHIPPING_COST,
        20000,
      ),
      hasFreeShippingVoucher,
    },
    shippingEtaDays,
  );

  return {
    items,
    subtotal,
    productDiscountTotal,
    voucherDiscountTotal,
    shippingCost: shipping.cost,
    grandTotal: Math.max(0, subtotal - voucherDiscountTotal + shipping.cost),
    appliedVouchers,
    rejectedVouchers,
    shippingMethod: shipping.method,
    shippingEtaDays,
    allowGuestCheckout: getStoreConfigBooleanValue(
      configSnapshot,
      StoreConfigKeys.ALLOW_GUEST_CHECKOUT,
      false,
    ),
  };
}
