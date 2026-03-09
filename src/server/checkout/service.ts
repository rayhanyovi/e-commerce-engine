import { Prisma } from "@prisma/client";

import {
  type CheckoutPreviewDto,
  type CheckoutPreviewResult,
  StoreConfigKeys,
  ErrorCodes,
} from "@/shared/contracts";
import {
  calculateShipping,
  getEffectivePrice,
} from "@/server/domain";
import { prisma } from "@/server/db";
import { AppError } from "@/server/http";
import type { CartIdentity } from "@/server/cart";
import { validateVoucherSelection } from "@/server/promotions";
import {
  getStoreConfigNumberValue,
  getStoreConfigSnapshot,
  getStoreConfigTextValue,
} from "@/server/store-config";

type DbClient = Prisma.TransactionClient | typeof prisma;

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

export interface CheckoutQuote {
  cart: CheckoutCart;
  preview: CheckoutPreviewResult;
  appliedPromotionRecords: Awaited<
    ReturnType<typeof validateVoucherSelection>
  >["appliedPromotionRecords"];
}

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

async function loadActiveCart(identity: CartIdentity, db: DbClient = prisma) {
  const cart = await db.cart.findFirst({
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

export async function buildCheckoutQuote(
  identity: CartIdentity,
  dto: CheckoutPreviewDto,
  db: DbClient = prisma,
): Promise<CheckoutQuote> {
  const cart = await loadActiveCart(identity, db);
  const configSnapshot = await getStoreConfigSnapshot(
    [
      StoreConfigKeys.CURRENCY,
      StoreConfigKeys.FREE_SHIPPING_THRESHOLD,
      StoreConfigKeys.INTERNAL_FLAT_SHIPPING_COST,
      StoreConfigKeys.INTERNAL_FLAT_SHIPPING_ETA_DAYS,
    ],
    db,
  );
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
  const {
    appliedVouchers,
    appliedPromotionRecords,
    rejectedVouchers,
    voucherDiscountTotal,
    hasFreeShippingVoucher,
  } = await validateVoucherSelection(
    {
      codes: dto.voucherCodes,
      subtotal,
      productDiscountTotal,
      userId: identity.userId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        productVariantId: item.productVariantId,
        categoryId: item.product.categoryId,
      })),
    },
    db,
  );
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

  const preview: CheckoutPreviewResult = {
    items,
    currency: getStoreConfigTextValue(configSnapshot, StoreConfigKeys.CURRENCY, "IDR"),
    subtotal,
    productDiscountTotal,
    voucherDiscountTotal,
    shippingCost: shipping.cost,
    grandTotal: Math.max(0, subtotal - voucherDiscountTotal + shipping.cost),
    appliedVouchers,
    rejectedVouchers,
    shippingMethod: shipping.method,
    shippingEtaDays,
  };

  return {
    cart,
    preview,
    appliedPromotionRecords,
  };
}

export async function getCheckoutPreview(
  identity: CartIdentity,
  dto: CheckoutPreviewDto,
  db: DbClient = prisma,
): Promise<CheckoutPreviewResult> {
  const quote = await buildCheckoutQuote(identity, dto, db);

  return quote.preview;
}
