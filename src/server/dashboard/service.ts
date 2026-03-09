import { Prisma } from "@prisma/client";

import { prisma } from "@/server/db";
import { DEFAULT_STORE_CONFIG_DEFINITIONS } from "@/server/store-config";

const recentOrderInclude = {
  payments: {
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  },
} satisfies Prisma.OrderInclude;

const reviewQueueInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      grandTotal: true,
      currency: true,
      placedAt: true,
    },
  },
  proofs: {
    orderBy: {
      uploadedAt: "desc",
    },
    take: 1,
  },
} satisfies Prisma.PaymentInclude;

const lowStockVariantInclude = {
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
} satisfies Prisma.ProductVariantInclude;

const recentAuditInclude = {
  actor: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.AuditLogInclude;

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

function serializeAuditEvent(
  event: Prisma.AuditLogGetPayload<{
    include: typeof recentAuditInclude;
  }>,
) {
  return {
    ...event,
    actorLabel: event.actorLabel
      ? event.actorLabel
      : event.actor
      ? `${event.actor.name} (${event.actor.role})`
      : event.actorType === "SYSTEM"
        ? "System"
        : event.actorId ?? "Unknown actor",
  };
}

export async function getAdminDashboardSummary() {
  const [
    totalOrders,
    pendingOrders,
    paymentReviewCount,
    activeProducts,
    activePromotions,
    lowStockCount,
    existingConfigCount,
    paidRevenueAggregate,
    recentOrders,
    paymentQueue,
    lowStockVariants,
    recentAuditEvents,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: {
        status: {
          in: ["PENDING_PAYMENT", "PAYMENT_REVIEW"],
        },
      },
    }),
    prisma.payment.count({
      where: {
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW"],
        },
      },
    }),
    prisma.product.count({
      where: {
        isActive: true,
      },
    }),
    prisma.promotion.count({
      where: {
        isActive: true,
      },
    }),
    prisma.productVariant.count({
      where: {
        isActive: true,
        stockOnHand: {
          lte: 5,
        },
      },
    }),
    prisma.storeConfig.count({
      where: {
        key: {
          in: DEFAULT_STORE_CONFIG_DEFINITIONS.map((definition) => definition.key),
        },
      },
    }),
    prisma.order.aggregate({
      _sum: {
        grandTotal: true,
      },
      where: {
        status: {
          in: ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"],
        },
      },
    }),
    prisma.order.findMany({
      orderBy: {
        placedAt: "desc",
      },
      take: 5,
      include: recentOrderInclude,
    }),
    prisma.payment.findMany({
      where: {
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW"],
        },
      },
      orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
      take: 5,
      include: reviewQueueInclude,
    }),
    prisma.productVariant.findMany({
      where: {
        isActive: true,
        stockOnHand: {
          lte: 5,
        },
      },
      orderBy: {
        stockOnHand: "asc",
      },
      take: 5,
      include: lowStockVariantInclude,
    }),
    prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: recentAuditInclude,
    }),
  ]);

  return {
    metrics: {
      totalOrders,
      pendingOrders,
      paymentReviewCount,
      activeProducts,
      activePromotions,
      lowStockCount,
      missingConfigCount: Math.max(
        0,
        DEFAULT_STORE_CONFIG_DEFINITIONS.length - existingConfigCount,
      ),
      paidRevenue: paidRevenueAggregate._sum.grandTotal ?? 0,
    },
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      grandTotal: order.grandTotal,
      currency: order.currency,
      placedAt: order.placedAt,
      paymentStatus: order.payments[0]?.status ?? null,
    })),
    paymentQueue: paymentQueue.map((payment) => ({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      order: payment.order,
      latestProof: payment.proofs[0] ?? null,
    })),
    lowStockVariants: lowStockVariants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      stockOnHand: variant.stockOnHand,
      product: variant.product,
      variantLabel: formatVariantLabel(variant.optionCombination, variant.sku),
    })),
    recentAuditEvents: recentAuditEvents.map(serializeAuditEvent),
  };
}
