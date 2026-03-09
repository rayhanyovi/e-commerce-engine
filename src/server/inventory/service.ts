import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import {
  type AdjustStockDto,
  type LowStockQuery,
  type StockMovementsQuery,
} from "@/shared/contracts";
import { writeAuditLog } from "@/server/audit";
import { prisma } from "@/server/db";
import { AppError } from "@/server/http";

export const STOCK_MOVEMENT_LABELS: Record<string, string> = {
  ADJUSTMENT_IN: "Stock In",
  ADJUSTMENT_OUT: "Stock Out",
  ORDER_RESERVE: "Order Reserve",
  ORDER_CANCEL_RELEASE: "Cancel Release",
  ORDER_CONSUME: "Order Consume",
  INITIAL_STOCK: "Initial Stock",
};

function createManualAdjustmentReferenceId() {
  return `ADJ-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function formatActorLabel(actor: {
  id: string;
  name: string;
  email: string;
} | null) {
  if (!actor) {
    return "System";
  }

  return actor.name || actor.email || actor.id;
}

function formatReferenceLabel(movement: {
  type: string;
  referenceId: string | null;
}) {
  if (!movement.referenceId) {
    return "None";
  }

  if (
    movement.type === "ORDER_RESERVE" ||
    movement.type === "ORDER_CANCEL_RELEASE" ||
    movement.type === "ORDER_CONSUME"
  ) {
    return `Order ${movement.referenceId}`;
  }

  if (
    movement.type === "ADJUSTMENT_IN" ||
    movement.type === "ADJUSTMENT_OUT"
  ) {
    return `Adjustment ${movement.referenceId}`;
  }

  return movement.referenceId;
}

function formatVariantLabel(
  optionCombination: Array<{
    optionValue: {
      value: string;
      optionDefinition: {
        name: string;
      };
    };
  }>,
  fallback?: string | null,
) {
  if (!optionCombination.length) {
    return fallback ?? "-";
  }

  return optionCombination
    .map(
      (item) => `${item.optionValue.optionDefinition.name}: ${item.optionValue.value}`,
    )
    .join(", ");
}

export async function adjustStock(dto: AdjustStockDto, actorId: string) {
  const variant = await prisma.productVariant.findUnique({
    where: {
      id: dto.productVariantId,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!variant) {
    throw new AppError(404, "NOT_FOUND", "Variant not found");
  }

  const newStock = variant.stockOnHand + dto.qty;

  if (newStock < 0) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      `Cannot reduce stock below 0. Current: ${variant.stockOnHand}, adjustment: ${dto.qty}`,
    );
  }

  const type = dto.qty > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT";
  const referenceId = createManualAdjustmentReferenceId();

  const [updatedVariant, movement] = await prisma.$transaction(async (tx) => {
    const updated = await tx.productVariant.update({
      where: { id: dto.productVariantId },
      data: {
        stockOnHand: newStock,
      },
    });
    const createdMovement = await tx.stockMovement.create({
      data: {
        productVariantId: dto.productVariantId,
        type,
        qty: dto.qty,
        reason: dto.reason,
        referenceId,
        actorId,
      },
    });

    await writeAuditLog(tx, {
      actor: {
        type: "ADMIN",
        id: actorId,
      },
      entity: {
        type: "INVENTORY",
        id: dto.productVariantId,
        label: variant.product.name,
      },
      context: {
        type: "PRODUCT_VARIANT",
        id: dto.productVariantId,
        label: variant.sku ?? dto.productVariantId,
      },
      action: "INVENTORY_ADJUSTED",
      before: {
        productVariantId: dto.productVariantId,
        stockOnHand: variant.stockOnHand,
      },
      after: {
        productVariantId: dto.productVariantId,
        stockOnHand: updated.stockOnHand,
        qty: dto.qty,
        movementType: type,
        reason: dto.reason ?? null,
      },
      metadata: {
        movementId: createdMovement.id,
        productId: variant.product.id,
        productName: variant.product.name,
        referenceId,
      },
    });

    return [updated, createdMovement] as const;
  });

  return {
    variant: updatedVariant,
    movement,
  };
}

export async function listStockMovements(query: StockMovementsQuery) {
  const where: Prisma.StockMovementWhereInput = {};

  if (query.productVariantId) {
    where.productVariantId = query.productVariantId;
  }

  if (query.type) {
    where.type = query.type;
  }

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
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
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    movements: movements.map((movement) => ({
      ...movement,
      movementLabel: STOCK_MOVEMENT_LABELS[movement.type] ?? movement.type,
      variantLabel: formatVariantLabel(
        movement.variant.optionCombination,
        movement.variant.sku,
      ),
      actorLabel: formatActorLabel(movement.actor),
      referenceLabel: formatReferenceLabel(movement),
    })),
    total,
  };
}

export async function listLowStockVariants(query: LowStockQuery) {
  const where: Prisma.ProductVariantWhereInput = {
    stockOnHand: {
      lte: query.threshold,
    },
    isActive: true,
  };

  const [variants, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      orderBy: {
        stockOnHand: "asc",
      },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
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
    }),
    prisma.productVariant.count({ where }),
  ]);

  return {
    variants: variants.map((variant) => ({
      ...variant,
      variantLabel: formatVariantLabel(variant.optionCombination, variant.sku),
    })),
    total,
  };
}
