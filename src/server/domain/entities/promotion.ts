import type { PromotionScopeType, PromotionType } from "@/shared/contracts";

export type DiscountTypeEnum = PromotionType;
export type PromotionScopeTypeEnum = PromotionScopeType;

export interface PromotionEntity {
  id: string;
  code?: string | null;
  type: DiscountTypeEnum;
  value: number;
  minPurchase?: number | null;
  maxDiscountCap?: number | null;
  validFrom: Date;
  validUntil: Date;
  totalUsageLimit?: number | null;
  perUserUsageLimit?: number | null;
  totalUsed: number;
  isActive: boolean;
  isStackable: boolean;
  scopes: PromotionScopeEntity[];
}

export interface PromotionScopeEntity {
  id: string;
  promotionId: string;
  scopeType: PromotionScopeTypeEnum;
  targetId?: string | null;
}

export function isPromotionEligible(
  promotion: PromotionEntity,
  now: Date = new Date(),
  userUsageCount?: number,
): { eligible: boolean; reason?: string } {
  if (!promotion.isActive) {
    return { eligible: false, reason: "Promotion is inactive" };
  }

  if (now < promotion.validFrom) {
    return { eligible: false, reason: "Promotion not yet active" };
  }

  if (now > promotion.validUntil) {
    return { eligible: false, reason: "Promotion has expired" };
  }

  if (promotion.totalUsageLimit != null && promotion.totalUsed >= promotion.totalUsageLimit) {
    return { eligible: false, reason: "Promotion usage limit reached" };
  }

  if (
    promotion.perUserUsageLimit != null &&
    userUsageCount != null &&
    userUsageCount >= promotion.perUserUsageLimit
  ) {
    return { eligible: false, reason: "Per-user usage limit reached" };
  }

  return { eligible: true };
}

export function calculateDiscount(promotion: PromotionEntity, subtotal: number): number {
  switch (promotion.type) {
    case "PERCENTAGE": {
      const rawDiscount = Math.floor((subtotal * promotion.value) / 100);

      return promotion.maxDiscountCap != null
        ? Math.min(rawDiscount, promotion.maxDiscountCap)
        : rawDiscount;
    }

    case "FIXED_AMOUNT":
      return Math.min(promotion.value, subtotal);

    case "FREE_PRODUCT":
    case "FREE_SHIPPING":
      return 0;

    default:
      return 0;
  }
}
