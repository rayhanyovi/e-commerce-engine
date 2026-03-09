import { z } from "zod";

import { PaginationQuerySchema } from "../envelopes";

export const ProductSortSchema = z.enum(["newest", "price_asc", "price_desc", "name_asc"]);

export type ProductSort = z.infer<typeof ProductSortSchema>;

export const ProductListQuerySchema = PaginationQuerySchema.extend({
  category: z.string().optional(),
  search: z.string().optional(),
  sort: ProductSortSchema.default("newest"),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
});

export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;

export const ProductOptionDefinitionInputSchema = z.object({
  name: z.string().min(1),
  position: z.number().int().min(0).default(0),
  values: z.array(z.string().min(1)),
});

export const ProductVariantInputSchema = z.object({
  sku: z.string().optional(),
  priceOverride: z.number().int().min(0).optional().nullable(),
  stockOnHand: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  optionValues: z.array(z.string()),
});

export const CreateProductSchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  basePrice: z.number().int().min(0),
  promoPrice: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  mediaUrls: z.array(z.string().url()).default([]),
  optionDefinitions: z.array(ProductOptionDefinitionInputSchema).optional(),
  variants: z.array(ProductVariantInputSchema).optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
