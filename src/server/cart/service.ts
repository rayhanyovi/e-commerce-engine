import { Prisma } from "@prisma/client";

import {
  ErrorCodes,
  type AddCartItemDto,
  type CartSnapshot,
  type UpdateCartItemDto,
} from "@/shared/contracts";
import { prisma } from "@/server/db";
import { checkStockAvailability, getEffectivePrice } from "@/server/domain";
import { AppError } from "@/server/http";

export interface CartIdentity {
  userId?: string;
  guestToken?: string;
}

type DbClient = Prisma.TransactionClient | typeof prisma;

const cartInclude = {
  items: {
    orderBy: {
      id: "asc",
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          basePrice: true,
          promoPrice: true,
          isActive: true,
          mediaUrls: true,
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

type CartWithRelations = Prisma.CartGetPayload<{
  include: typeof cartInclude;
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
    "User or guest cart token required",
  );
}

function getAvailableQty(reservations: Array<{ qty: number }>, stockOnHand: number) {
  const activeReservations = reservations.reduce(
    (sum, reservation) => sum + reservation.qty,
    0,
  );

  return Math.max(0, stockOnHand - activeReservations);
}

function formatVariantLabel(
  optionCombination: CartWithRelations["items"][number]["variant"]["optionCombination"],
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

function serializeCart(cart: CartWithRelations): CartSnapshot {
  const items = cart.items.map((item) => {
    const unitPrice = getEffectivePrice(item.product, item.variant);
    const availableQty = getAvailableQty(item.variant.reservations, item.variant.stockOnHand);

    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      productVariantId: item.productVariantId,
      qty: item.qty,
      unitPrice,
      lineTotal: unitPrice * item.qty,
      variantLabel: formatVariantLabel(item.variant.optionCombination, item.variant.sku),
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        description: item.product.description,
        basePrice: item.product.basePrice,
        promoPrice: item.product.promoPrice,
        isActive: item.product.isActive,
        mediaUrls: item.product.mediaUrls,
      },
      variant: {
        id: item.variant.id,
        sku: item.variant.sku,
        priceOverride: item.variant.priceOverride,
        stockOnHand: item.variant.stockOnHand,
        isActive: item.variant.isActive,
        optionCombination: item.variant.optionCombination.map((option) => ({
          optionValue: {
            value: option.optionValue.value,
            optionDefinition: {
              name: option.optionValue.optionDefinition.name,
            },
          },
        })),
      },
      warnings: {
        inactiveProduct: !item.product.isActive,
        inactiveVariant: !item.variant.isActive,
        insufficientStock: availableQty < item.qty,
        availableQty,
      },
    };
  });

  return {
    id: cart.id,
    userId: cart.userId,
    guestToken: cart.guestToken,
    status: cart.status,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    items,
    summary: {
      itemCount: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
    },
  };
}

async function loadCartSnapshot(cartId: string) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: cartInclude,
  });

  if (!cart) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Cart not found");
  }

  return serializeCart(cart);
}

async function getVariantAvailability(
  db: DbClient,
  dto: Pick<AddCartItemDto, "productId" | "productVariantId">,
) {
  const variant = await db.productVariant.findUnique({
    where: {
      id: dto.productVariantId,
    },
    include: {
      product: {
        select: {
          id: true,
          isActive: true,
        },
      },
      reservations: {
        where: {
          status: "ACTIVE",
        },
        select: {
          qty: true,
        },
      },
    },
  });

  if (!variant || variant.productId !== dto.productId) {
    return {
      variant: null,
      availableQty: 0,
      isAvailable: false,
    };
  }

  if (!variant.product.isActive || !variant.isActive) {
    return {
      variant,
      availableQty: 0,
      isAvailable: false,
    };
  }

  const availableQty = getAvailableQty(variant.reservations, variant.stockOnHand);

  return {
    variant,
    availableQty,
    isAvailable: availableQty > 0,
  };
}

async function ensureVariantCanBeAdded(
  db: DbClient,
  dto: Pick<AddCartItemDto, "productId" | "productVariantId">,
  requestedQty: number,
) {
  const availability = await getVariantAvailability(db, dto);

  if (!availability.variant) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Product variant not found");
  }

  if (!availability.variant.product.isActive || !availability.variant.isActive) {
    throw new AppError(
      400,
      ErrorCodes.VALIDATION_ERROR,
      "Product or variant is no longer available",
    );
  }

  const stockCheck = checkStockAvailability([
    {
      productVariantId: dto.productVariantId,
      requestedQty,
      stockOnHand: availability.variant.stockOnHand,
      activeReservations: availability.variant.reservations.reduce(
        (sum, reservation) => sum + reservation.qty,
        0,
      ),
    },
  ]);

  if (!stockCheck.available) {
    throw new AppError(
      400,
      ErrorCodes.INSUFFICIENT_STOCK,
      "Requested quantity exceeds available stock",
      {
        availableQty: availability.availableQty,
        requestedQty,
      },
    );
  }

  return availability;
}

async function ensureOwnedCartItem(identity: CartIdentity, itemId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
      product: {
        select: {
          id: true,
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
        },
      },
    },
  });

  if (!item) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Cart item not found");
  }

  if (identity.userId) {
    if (item.cart.userId !== identity.userId) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Cart item not found");
    }
  } else if (identity.guestToken) {
    if (item.cart.guestToken !== identity.guestToken) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Cart item not found");
    }
  }

  return item;
}

export async function getOrCreateActiveCart(identity: CartIdentity) {
  const where = getCartWhere(identity);

  let cart = await prisma.cart.findFirst({
    where: {
      ...where,
      status: "ACTIVE",
    },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: identity.userId,
        guestToken: identity.guestToken,
        status: "ACTIVE",
      },
      include: cartInclude,
    });
  }

  return loadCartSnapshot(cart.id);
}

export async function addCartItem(identity: CartIdentity, dto: AddCartItemDto) {
  const cart = await getOrCreateActiveCart(identity);
  const existingItem = cart.items.find(
    (item) => item.productVariantId === dto.productVariantId,
  );
  const requestedQty = (existingItem?.qty ?? 0) + dto.qty;

  await ensureVariantCanBeAdded(prisma, dto, requestedQty);

  if (existingItem) {
    await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        qty: requestedQty,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        productVariantId: dto.productVariantId,
        qty: dto.qty,
      },
    });
  }

  return loadCartSnapshot(cart.id);
}

export async function updateCartItem(
  identity: CartIdentity,
  itemId: string,
  dto: UpdateCartItemDto,
) {
  const item = await ensureOwnedCartItem(identity, itemId);

  await ensureVariantCanBeAdded(
    prisma,
    {
      productId: item.productId,
      productVariantId: item.productVariantId,
    },
    dto.qty,
  );

  await prisma.cartItem.update({
    where: {
      id: item.id,
    },
    data: {
      qty: dto.qty,
    },
  });

  return loadCartSnapshot(item.cartId);
}

export async function removeCartItem(identity: CartIdentity, itemId: string) {
  const item = await ensureOwnedCartItem(identity, itemId);

  await prisma.cartItem.delete({
    where: {
      id: item.id,
    },
  });

  return loadCartSnapshot(item.cartId);
}

export async function clearActiveCart(identity: CartIdentity) {
  const cart = await getOrCreateActiveCart(identity);

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return loadCartSnapshot(cart.id);
}

export async function claimGuestCart(userId: string, guestToken: string) {
  await prisma.$transaction(async (tx) => {
    const guestCart = await tx.cart.findFirst({
      where: {
        guestToken,
        status: "ACTIVE",
      },
      include: {
        items: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!guestCart) {
      return;
    }

    const userCart = await tx.cart.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        items: true,
      },
    });

    if (!userCart) {
      await tx.cart.update({
        where: {
          id: guestCart.id,
        },
        data: {
          userId,
          guestToken: null,
        },
      });

      return;
    }

    if (userCart.id === guestCart.id) {
      await tx.cart.update({
        where: {
          id: guestCart.id,
        },
        data: {
          guestToken: null,
        },
      });

      return;
    }

    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(
        (item) => item.productVariantId === guestItem.productVariantId,
      );
      const combinedQty = (existingItem?.qty ?? 0) + guestItem.qty;
      const availability = await getVariantAvailability(tx, {
        productId: guestItem.productId,
        productVariantId: guestItem.productVariantId,
      });

      if (!availability.variant || !availability.isAvailable) {
        continue;
      }

      const nextQty = Math.min(combinedQty, availability.availableQty);

      if (nextQty <= 0) {
        continue;
      }

      if (existingItem) {
        await tx.cartItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            qty: nextQty,
          },
        });

        continue;
      }

      await tx.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: guestItem.productId,
          productVariantId: guestItem.productVariantId,
          qty: nextQty,
        },
      });
    }

    await tx.cart.delete({
      where: {
        id: guestCart.id,
      },
    });
  });
}
