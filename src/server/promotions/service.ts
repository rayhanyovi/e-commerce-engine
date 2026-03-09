import { Prisma } from "@prisma/client";

import {
  ErrorCodes,
  StoreConfigKeys,
  type CreatePromotionDto,
  type PromotionListQuery,
  type PromotionScopeInput,
  type UpdatePromotionDto,
  type ValidateVoucherDto,
} from "@/shared/contracts";
import { calculateDiscount, isPromotionEligible } from "@/server/domain";
import { prisma } from "@/server/db";
import { AppError } from "@/server/http";
import {
  getStoreConfigBooleanValue,
  getStoreConfigNumberValue,
  getStoreConfigSnapshot,
} from "@/server/store-config";

type DbClient = Prisma.TransactionClient | typeof prisma;

const promotionInclude = {
  scopes: {
    orderBy: [{ scopeType: "asc" }, { targetId: "asc" }],
  },
  usages: {
    select: {
      id: true,
      userId: true,
    },
  },
} satisfies Prisma.PromotionInclude;

type PromotionRecord = Prisma.PromotionGetPayload<{
  include: typeof promotionInclude;
}>;

export interface VoucherValidationItem {
  productId: string;
  productVariantId: string;
  categoryId: string;
}

export interface VoucherValidationResult {
  appliedVouchers: Array<{
    code: string;
    discount: number;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_PRODUCT" | "FREE_SHIPPING";
  }>;
  appliedPromotionRecords: Array<{
    promotionId: string;
    code: string;
    discount: number;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_PRODUCT" | "FREE_SHIPPING";
  }>;
  rejectedVouchers: Array<{
    code: string;
    reason: string;
  }>;
  voucherDiscountTotal: number;
  hasFreeShippingVoucher: boolean;
}

function serializePromotion(promotion: PromotionRecord) {
  return {
    ...promotion,
    usageCount: promotion.usages.length,
  };
}

function getPromotionWhere(query: PromotionListQuery): Prisma.PromotionWhereInput {
  const where: Prisma.PromotionWhereInput = {};

  if (query.search) {
    where.OR = [
      {
        code: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        scopes: {
          some: {
            targetId: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.status) {
    where.isActive = query.status === "active";
  }

  return where;
}

function normalizePromotionCode(code: string | null | undefined) {
  return code ? code.trim().toUpperCase() : null;
}

function normalizeScopes(scopes: PromotionScopeInput[] | undefined) {
  const sourceScopes: PromotionScopeInput[] =
    scopes && scopes.length
      ? scopes
      : [{ scopeType: "ALL_PRODUCTS", targetId: null }];
  const uniqueScopes = new Map<string, PromotionScopeInput>();

  for (const scope of sourceScopes) {
    const normalizedScope: PromotionScopeInput = {
      scopeType: scope.scopeType,
      targetId: scope.scopeType === "ALL_PRODUCTS" ? null : scope.targetId?.trim() ?? null,
    };
    const key = `${normalizedScope.scopeType}:${normalizedScope.targetId ?? "*"}`;

    uniqueScopes.set(key, normalizedScope);
  }

  return Array.from(uniqueScopes.values());
}

function validatePromotionWindow(validFrom: Date, validUntil: Date) {
  if (validUntil < validFrom) {
    throw new AppError(
      400,
      ErrorCodes.VALIDATION_ERROR,
      "Promotion validUntil must be later than validFrom",
    );
  }
}

async function ensureUniquePromotionCode(
  code: string | null,
  excludedPromotionId?: string,
  db: DbClient = prisma,
) {
  if (!code) {
    return;
  }

  const existingPromotion = await db.promotion.findFirst({
    where: {
      code,
      ...(excludedPromotionId
        ? {
            NOT: {
              id: excludedPromotionId,
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });

  if (existingPromotion) {
    throw new AppError(409, ErrorCodes.VALIDATION_ERROR, "Promotion code already exists");
  }
}

function isPromotionApplicableToItems(
  promotion: {
    scopes: Array<{
      scopeType: "ALL_PRODUCTS" | "CATEGORY" | "PRODUCT" | "VARIANT";
      targetId: string | null;
    }>;
  },
  items: VoucherValidationItem[],
) {
  if (!promotion.scopes.length || !items.length) {
    return !promotion.scopes.length || promotion.scopes.some((scope) => scope.scopeType === "ALL_PRODUCTS");
  }

  return promotion.scopes.some((scope) => {
    switch (scope.scopeType) {
      case "ALL_PRODUCTS":
        return true;

      case "CATEGORY":
        return items.some((item) => item.categoryId === scope.targetId);

      case "PRODUCT":
        return items.some((item) => item.productId === scope.targetId);

      case "VARIANT":
        return items.some((item) => item.productVariantId === scope.targetId);

      default:
        return false;
    }
  });
}

export async function validateVoucherSelection(
  input: {
    codes: string[];
    subtotal: number;
    productDiscountTotal: number;
    userId?: string;
    items: VoucherValidationItem[];
  },
  db: DbClient = prisma,
): Promise<VoucherValidationResult> {
  const normalizedCodes = Array.from(
    new Set(input.codes.map((code) => code.trim().toUpperCase()).filter(Boolean)),
  );

  if (!normalizedCodes.length) {
    return {
      appliedVouchers: [],
      appliedPromotionRecords: [],
      rejectedVouchers: [],
      voucherDiscountTotal: 0,
      hasFreeShippingVoucher: false,
    };
  }

  const configSnapshot = await getStoreConfigSnapshot(
    [
      StoreConfigKeys.MAX_VOUCHERS_PER_ORDER,
      StoreConfigKeys.ALLOW_VOUCHER_STACKING,
      StoreConfigKeys.ALLOW_VOUCHER_WITH_PRODUCT_DISCOUNT,
    ],
    db,
  );
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
  const promotions = await db.promotion.findMany({
    where: {
      code: {
        in: acceptedCodes,
      },
    },
    include: promotionInclude,
  });
  const promotionMap = new Map(
    promotions
      .filter((promotion) => promotion.code)
      .map((promotion) => [promotion.code as string, promotion]),
  );
  const rejectedVouchers = ignoredCodes.map((code) => ({
    code,
    reason: allowVoucherStacking
      ? "Maximum voucher limit reached for one order"
      : "Voucher stacking is disabled for this store",
  }));
  const appliedVouchers: VoucherValidationResult["appliedVouchers"] = [];
  const appliedPromotionRecords: VoucherValidationResult["appliedPromotionRecords"] = [];
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

    const userUsageCount = input.userId
      ? promotion.usages.filter((usage) => usage.userId === input.userId).length
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

    if (!isPromotionApplicableToItems(promotion, input.items)) {
      rejectedVouchers.push({
        code,
        reason: "Voucher does not match the current cart scope",
      });
      continue;
    }

    if (promotion.minPurchase != null && input.subtotal < promotion.minPurchase) {
      rejectedVouchers.push({
        code,
        reason: `Minimum purchase is ${promotion.minPurchase}`,
      });
      continue;
    }

    if (!allowVoucherWithProductDiscount && input.productDiscountTotal > 0) {
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
      input.subtotal,
    );

    appliedVouchers.push({
      code,
      discount,
      type: promotion.type,
    });
    appliedPromotionRecords.push({
      promotionId: promotion.id,
      code,
      discount,
      type: promotion.type,
    });
    voucherDiscountTotal += discount;
    hasFreeShippingVoucher = hasFreeShippingVoucher || promotion.type === "FREE_SHIPPING";
  }

  return {
    appliedVouchers,
    appliedPromotionRecords,
    rejectedVouchers,
    voucherDiscountTotal,
    hasFreeShippingVoucher,
  };
}

export async function validateVoucherCodes(dto: ValidateVoucherDto, db: DbClient = prisma) {
  const result = await validateVoucherSelection(
    {
      codes: dto.codes,
      subtotal: dto.subtotal,
      productDiscountTotal: dto.productDiscountTotal,
      userId: dto.userId,
      items: dto.items,
    },
    db,
  );

  return dto.codes.map((code) => {
    const normalizedCode = code.trim().toUpperCase();
    const applied = result.appliedVouchers.find((voucher) => voucher.code === normalizedCode);
    const rejected = result.rejectedVouchers.find((voucher) => voucher.code === normalizedCode);

    return {
      code: normalizedCode,
      valid: Boolean(applied),
      discount: applied?.discount ?? 0,
      reason: rejected?.reason,
      type: applied?.type ?? null,
    };
  });
}

export async function listAdminPromotions(query: PromotionListQuery) {
  const where = getPromotionWhere(query);
  const [promotions, total] = await Promise.all([
    prisma.promotion.findMany({
      where,
      include: promotionInclude,
      orderBy: {
        createdAt: "desc",
      },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.promotion.count({
      where,
    }),
  ]);

  return {
    promotions: promotions.map(serializePromotion),
    total,
  };
}

export async function createPromotion(dto: CreatePromotionDto, actorId?: string) {
  validatePromotionWindow(dto.validFrom, dto.validUntil);
  const code = normalizePromotionCode(dto.code);
  await ensureUniquePromotionCode(code);
  const scopes = normalizeScopes(dto.scopes);

  const promotion = await prisma.promotion.create({
    data: {
      code,
      type: dto.type,
      value: dto.value,
      minPurchase: dto.minPurchase ?? null,
      maxDiscountCap: dto.maxDiscountCap ?? null,
      validFrom: dto.validFrom,
      validUntil: dto.validUntil,
      totalUsageLimit: dto.totalUsageLimit ?? null,
      perUserUsageLimit: dto.perUserUsageLimit ?? null,
      isActive: dto.isActive,
      isStackable: dto.isStackable,
      scopes: {
        create: scopes,
      },
    },
    include: promotionInclude,
  });

  await prisma.auditLog.create({
    data: {
      actorType: "ADMIN",
      actorId: actorId ?? null,
      entityType: "PROMOTION",
      entityId: promotion.id,
      action: "PROMOTION_CREATED",
      afterJson: {
        code: promotion.code,
        type: promotion.type,
        scopeCount: promotion.scopes.length,
      },
    },
  });

  return serializePromotion(promotion);
}

export async function updatePromotion(
  id: string,
  dto: UpdatePromotionDto,
  actorId?: string,
) {
  const existingPromotion = await prisma.promotion.findUnique({
    where: {
      id,
    },
    include: promotionInclude,
  });

  if (!existingPromotion) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Promotion not found");
  }

  const nextValidFrom = dto.validFrom ?? existingPromotion.validFrom;
  const nextValidUntil = dto.validUntil ?? existingPromotion.validUntil;
  validatePromotionWindow(nextValidFrom, nextValidUntil);
  const code =
    dto.code === undefined ? existingPromotion.code : normalizePromotionCode(dto.code);
  await ensureUniquePromotionCode(code, id);
  const scopes = dto.scopes ? normalizeScopes(dto.scopes) : null;

  const promotion = await prisma.$transaction(async (tx) => {
    await tx.promotion.update({
      where: {
        id,
      },
      data: {
        code,
        type: dto.type,
        value: dto.value,
        minPurchase: dto.minPurchase === undefined ? undefined : dto.minPurchase ?? null,
        maxDiscountCap:
          dto.maxDiscountCap === undefined ? undefined : dto.maxDiscountCap ?? null,
        validFrom: dto.validFrom,
        validUntil: dto.validUntil,
        totalUsageLimit:
          dto.totalUsageLimit === undefined ? undefined : dto.totalUsageLimit ?? null,
        perUserUsageLimit:
          dto.perUserUsageLimit === undefined ? undefined : dto.perUserUsageLimit ?? null,
        isActive: dto.isActive,
        isStackable: dto.isStackable,
      },
      include: promotionInclude,
    });

    if (scopes) {
      await tx.promotionScope.deleteMany({
        where: {
          promotionId: id,
        },
      });
      await tx.promotionScope.createMany({
        data: scopes.map((scope) => ({
          promotionId: id,
          scopeType: scope.scopeType,
          targetId: scope.scopeType === "ALL_PRODUCTS" ? null : scope.targetId ?? null,
        })),
      });
    }

    return tx.promotion.findUniqueOrThrow({
      where: {
        id,
      },
      include: promotionInclude,
    });
  });

  await prisma.auditLog.create({
    data: {
      actorType: "ADMIN",
      actorId: actorId ?? null,
      entityType: "PROMOTION",
      entityId: promotion.id,
      action: "PROMOTION_UPDATED",
      beforeJson: {
        code: existingPromotion.code,
        type: existingPromotion.type,
        scopeCount: existingPromotion.scopes.length,
      },
      afterJson: {
        code: promotion.code,
        type: promotion.type,
        scopeCount: promotion.scopes.length,
      },
    },
  });

  return serializePromotion(promotion);
}

export async function deletePromotion(id: string, actorId?: string) {
  const promotion = await prisma.promotion.findUnique({
    where: {
      id,
    },
    include: {
      usages: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!promotion) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Promotion not found");
  }

  if (promotion.usages.length) {
    throw new AppError(
      400,
      ErrorCodes.VALIDATION_ERROR,
      "Promotion with usage history cannot be deleted",
    );
  }

  await prisma.promotion.delete({
    where: {
      id,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorType: "ADMIN",
      actorId: actorId ?? null,
      entityType: "PROMOTION",
      entityId: id,
      action: "PROMOTION_DELETED",
      beforeJson: {
        code: promotion.code,
        type: promotion.type,
      },
    },
  });

  return {
    deleted: true,
  };
}
