export interface ProductEntity {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  promoPrice?: number | null;
  isActive: boolean;
  mediaUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductOptionDefinitionEntity {
  id: string;
  productId: string;
  name: string;
  position: number;
  values: ProductOptionValueEntity[];
}

export interface ProductOptionValueEntity {
  id: string;
  optionDefinitionId: string;
  value: string;
}

export interface ProductVariantEntity {
  id: string;
  productId: string;
  sku?: string | null;
  priceOverride?: number | null;
  stockOnHand: number;
  isActive: boolean;
  optionCombination: {
    optionValueId: string;
    value: string;
    optionName: string;
  }[];
}

export function getEffectivePrice(
  product: Pick<ProductEntity, "basePrice" | "promoPrice">,
  variant: Pick<ProductVariantEntity, "priceOverride">,
): number {
  if (variant.priceOverride != null) {
    return variant.priceOverride;
  }

  if (product.promoPrice != null) {
    return product.promoPrice;
  }

  return product.basePrice;
}
