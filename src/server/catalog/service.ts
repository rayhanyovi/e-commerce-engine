import { Prisma, type Product } from "@prisma/client";

import {
  ErrorCodes,
  type CreateCategoryDto,
  type CreateProductDto,
  type ProductListQuery,
  type UpdateCategoryDto,
  type UpdateProductDto,
} from "@/shared/contracts";
import { prisma } from "@/server/db";
import { getEffectivePrice } from "@/server/domain";
import { AppError } from "@/server/http";

function buildProductOrderBy(sort: ProductListQuery["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { basePrice: "asc" };
    case "price_desc":
      return { basePrice: "desc" };
    case "name_asc":
      return { name: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

const productListInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  variants: {
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
    include: {
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
} satisfies Prisma.ProductInclude;

const productAdminInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  variants: {
    orderBy: {
      id: "asc",
    },
    include: {
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
  _count: {
    select: {
      variants: true,
    },
  },
} satisfies Prisma.ProductInclude;

const productDetailInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  optionDefinitions: {
    orderBy: {
      position: "asc",
    },
    include: {
      values: {
        orderBy: {
          value: "asc",
        },
      },
    },
  },
  variants: {
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
    include: {
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
} satisfies Prisma.ProductInclude;

type ProductWithVariant = Product & {
  promoPrice: number | null;
};

function getProductPriceRange(product: {
  basePrice: number;
  promoPrice: number | null;
  variants: Array<{ priceOverride: number | null }>;
}) {
  const prices = product.variants.length
    ? product.variants.map((variant) =>
        getEffectivePrice(
          {
            basePrice: product.basePrice,
            promoPrice: product.promoPrice,
          },
          {
            priceOverride: variant.priceOverride,
          },
        ),
      )
    : [product.promoPrice ?? product.basePrice];

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

function serializeProductListItem<T extends ProductWithVariant & { variants: Array<{ priceOverride: number | null }> }>(
  product: T,
) {
  return {
    ...product,
    priceRange: getProductPriceRange(product),
  };
}

type DbClient = Prisma.TransactionClient | typeof prisma;
type NormalizedProductOptionDefinitionInput = {
  name: string;
  position: number;
  values: string[];
};
type NormalizedProductVariantInput = {
  sku: string | null;
  priceOverride: number | null;
  stockOnHand: number;
  isActive: boolean;
  optionValues: string[];
};

function normalizeOptionDefinitionInput(
  optionDefinitions: CreateProductDto["optionDefinitions"] | UpdateProductDto["optionDefinitions"],
): NormalizedProductOptionDefinitionInput[] {
  return (optionDefinitions ?? [])
    .map((definition, index) => ({
      name: definition.name.trim(),
      position: definition.position ?? index,
      values: Array.from(
        new Set(
          definition.values
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ),
    }))
    .filter((definition) => definition.name && definition.values.length);
}

function normalizeVariantInput(
  variants: CreateProductDto["variants"] | UpdateProductDto["variants"],
): NormalizedProductVariantInput[] {
  return (variants ?? []).map((variant) => ({
    sku: variant.sku?.trim() || null,
    priceOverride: variant.priceOverride ?? null,
    stockOnHand: variant.stockOnHand ?? 0,
    isActive: variant.isActive ?? true,
    optionValues: Array.from(
      new Set(
        variant.optionValues
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ),
  }));
}

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Category not found");
  }
}

async function assertProductSlugAvailable(slug: string, excludedProductId?: string) {
  const existingProduct = await prisma.product.findFirst({
    where: {
      slug,
      ...(excludedProductId ? { NOT: { id: excludedProductId } } : {}),
    },
    select: { id: true },
  });

  if (existingProduct) {
    throw new AppError(409, ErrorCodes.VALIDATION_ERROR, "Product slug already exists");
  }
}

async function assertVariantSkusAvailable(
  variants: NormalizedProductVariantInput[],
  excludedProductId?: string,
) {
  const skus = variants
    .map((variant) => variant.sku)
    .filter((sku): sku is string => Boolean(sku));

  const duplicatedSku = skus.find((sku, index) => skus.indexOf(sku) !== index);

  if (duplicatedSku) {
    throw new AppError(409, ErrorCodes.VALIDATION_ERROR, `Variant SKU already exists: ${duplicatedSku}`);
  }

  if (!skus.length) {
    return;
  }

  const existingVariants = await prisma.productVariant.findMany({
    where: {
      sku: { in: skus },
      ...(excludedProductId ? { productId: { not: excludedProductId } } : {}),
    },
    select: { sku: true },
  });

  if (existingVariants[0]?.sku) {
    throw new AppError(
      409,
      ErrorCodes.VALIDATION_ERROR,
      `Variant SKU already exists: ${existingVariants[0].sku}`,
    );
  }
}

function validateOptionDefinitionsAndVariants(
  optionDefinitions: NormalizedProductOptionDefinitionInput[],
  variants: NormalizedProductVariantInput[],
) {
  const optionValueToDefinition = new Map<string, string>();
  const duplicateOptionValue = new Set<string>();

  for (const definition of optionDefinitions) {
    for (const value of definition.values) {
      if (optionValueToDefinition.has(value)) {
        duplicateOptionValue.add(value);
        continue;
      }

      optionValueToDefinition.set(value, definition.name);
    }
  }

  if (duplicateOptionValue.size) {
    throw new AppError(
      400,
      ErrorCodes.VALIDATION_ERROR,
      `Option values must be unique per product. Duplicate values: ${Array.from(duplicateOptionValue).join(", ")}`,
    );
  }

  if (!optionDefinitions.length) {
    const variantWithUnexpectedOptions = variants.find((variant) => variant.optionValues.length);

    if (variantWithUnexpectedOptions) {
      throw new AppError(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Variants cannot reference option values before option definitions are configured",
      );
    }

    return;
  }

  const expectedDefinitionCount = optionDefinitions.length;
  const seenCombinations = new Set<string>();

  for (const variant of variants) {
    if (variant.optionValues.length !== expectedDefinitionCount) {
      throw new AppError(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Each variant must select exactly one value from every option definition",
      );
    }

    const definitionsForVariant = new Set<string>();

    for (const optionValue of variant.optionValues) {
      const definitionName = optionValueToDefinition.get(optionValue);

      if (!definitionName) {
        throw new AppError(
          400,
          ErrorCodes.VALIDATION_ERROR,
          `Unknown option value on variant: ${optionValue}`,
        );
      }

      if (definitionsForVariant.has(definitionName)) {
        throw new AppError(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Each variant must use only one value per option definition",
        );
      }

      definitionsForVariant.add(definitionName);
    }

    const combinationKey = [...variant.optionValues].sort().join("::");

    if (seenCombinations.has(combinationKey)) {
      throw new AppError(
        409,
        ErrorCodes.VALIDATION_ERROR,
        "Variant combinations must be unique within the same product",
      );
    }

    seenCombinations.add(combinationKey);
  }
}

async function createProductStructure(
  db: DbClient,
  productId: string,
  optionDefinitions: NormalizedProductOptionDefinitionInput[],
  variants: NormalizedProductVariantInput[],
) {
  const createdDefinitions = [];

  for (const definition of optionDefinitions) {
    const createdDefinition = await db.productOptionDefinition.create({
      data: {
        productId,
        name: definition.name,
        position: definition.position,
        values: {
          create: definition.values.map((value) => ({ value })),
        },
      },
      include: {
        values: true,
      },
    });

    createdDefinitions.push(createdDefinition);
  }

  const optionValueMap = new Map<string, string>();

  for (const definition of createdDefinitions) {
    for (const value of definition.values) {
      optionValueMap.set(value.value, value.id);
    }
  }

  for (const variant of variants) {
    const createdVariant = await db.productVariant.create({
      data: {
        productId,
        sku: variant.sku,
        priceOverride: variant.priceOverride,
        stockOnHand: variant.stockOnHand,
        isActive: variant.isActive,
      },
    });

    for (const optionValue of variant.optionValues) {
      const optionValueId = optionValueMap.get(optionValue);

      if (!optionValueId) {
        throw new AppError(
          400,
          ErrorCodes.VALIDATION_ERROR,
          `Unknown option value on variant: ${optionValue}`,
        );
      }

      await db.variantOptionCombination.create({
        data: {
          variantId: createdVariant.id,
          optionValueId,
        },
      });
    }
  }
}

async function assertProductStructureCanBeReplaced(productId: string) {
  const dependencySnapshot = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      _count: {
        select: {
          cartItems: true,
          orderItems: true,
        },
      },
      variants: {
        select: {
          _count: {
            select: {
              reservations: true,
              stockMovements: true,
            },
          },
        },
      },
    },
  });

  if (!dependencySnapshot) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Product not found");
  }

  const hasVariantDependencies = dependencySnapshot.variants.some(
    (variant) => variant._count.reservations > 0 || variant._count.stockMovements > 0,
  );

  if (
    dependencySnapshot._count.cartItems > 0 ||
    dependencySnapshot._count.orderItems > 0 ||
    hasVariantDependencies
  ) {
    throw new AppError(
      409,
      ErrorCodes.VALIDATION_ERROR,
      "Product variants cannot be rebuilt after the product has active cart, order, or stock history",
    );
  }
}

export async function listPublicCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function listAdminCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCategory(dto: CreateCategoryDto) {
  const existingCategory = await prisma.category.findUnique({
    where: { slug: dto.slug },
    select: { id: true },
  });

  if (existingCategory) {
    throw new AppError(409, "VALIDATION_ERROR", "Category slug already exists");
  }

  return prisma.category.create({
    data: dto,
  });
}

export async function updateCategory(id: string, dto: UpdateCategoryDto) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!category) {
    throw new AppError(404, "NOT_FOUND", "Category not found");
  }

  if (dto.slug) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: dto.slug,
        NOT: { id },
      },
      select: { id: true },
    });

    if (existingCategory) {
      throw new AppError(409, "VALIDATION_ERROR", "Category slug already exists");
    }
  }

  return prisma.category.update({
    where: { id },
    data: dto,
  });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!category) {
    throw new AppError(404, "NOT_FOUND", "Category not found");
  }

  await prisma.category.delete({
    where: { id },
  });

  return { deleted: true };
}

export async function createProduct(dto: CreateProductDto) {
  await assertCategoryExists(dto.categoryId);
  await assertProductSlugAvailable(dto.slug);

  const optionDefinitions = normalizeOptionDefinitionInput(dto.optionDefinitions);
  const variants = normalizeVariantInput(dto.variants);

  validateOptionDefinitionsAndVariants(optionDefinitions, variants);
  await assertVariantSkusAvailable(variants);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name.trim(),
        slug: dto.slug.trim(),
        description: dto.description?.trim() || null,
        basePrice: dto.basePrice,
        promoPrice: dto.promoPrice ?? null,
        isActive: dto.isActive ?? true,
        mediaUrls: dto.mediaUrls ?? [],
      },
      select: {
        id: true,
      },
    });

    await createProductStructure(tx, product.id, optionDefinitions, variants);

    return getAdminProductById(product.id);
  });
}

export async function updateProduct(id: string, dto: UpdateProductDto) {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      categoryId: true,
      slug: true,
    },
  });

  if (!existingProduct) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Product not found");
  }

  if (dto.categoryId) {
    await assertCategoryExists(dto.categoryId);
  }

  if (dto.slug && dto.slug !== existingProduct.slug) {
    await assertProductSlugAvailable(dto.slug, id);
  }

  const shouldReplaceStructure = dto.optionDefinitions !== undefined || dto.variants !== undefined;
  const optionDefinitions = normalizeOptionDefinitionInput(dto.optionDefinitions);
  const variants = normalizeVariantInput(dto.variants);

  if (shouldReplaceStructure) {
    validateOptionDefinitionsAndVariants(optionDefinitions, variants);
    await assertVariantSkusAvailable(variants, id);
    await assertProductStructureCanBeReplaced(id);
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        categoryId: dto.categoryId ?? undefined,
        name: dto.name?.trim() || undefined,
        slug: dto.slug?.trim() || undefined,
        description: dto.description === undefined ? undefined : dto.description.trim() || null,
        basePrice: dto.basePrice,
        promoPrice: dto.promoPrice === undefined ? undefined : dto.promoPrice ?? null,
        isActive: dto.isActive,
        mediaUrls: dto.mediaUrls,
      },
    });

    if (!shouldReplaceStructure) {
      return;
    }

    await tx.productVariant.deleteMany({
      where: { productId: id },
    });
    await tx.productOptionDefinition.deleteMany({
      where: { productId: id },
    });

    await createProductStructure(tx, id, optionDefinitions, variants);
  });

  return getAdminProductById(id);
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: {
          cartItems: true,
          orderItems: true,
        },
      },
      variants: {
        select: {
          _count: {
            select: {
              reservations: true,
              stockMovements: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Product not found");
  }

  const hasDependencies =
    product._count.cartItems > 0 ||
    product._count.orderItems > 0 ||
    product.variants.some(
      (variant) => variant._count.reservations > 0 || variant._count.stockMovements > 0,
    );

  if (hasDependencies) {
    throw new AppError(
      409,
      ErrorCodes.VALIDATION_ERROR,
      "Product cannot be deleted after it has cart, order, or stock history",
    );
  }

  await prisma.product.delete({
    where: { id },
  });

  return { deleted: true };
}

export async function listProducts(query: ProductListQuery) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (query.category) {
    where.category = {
      slug: query.category,
    };
  }

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.minPrice != null || query.maxPrice != null) {
    where.basePrice = {};
    if (query.minPrice != null) {
      where.basePrice.gte = query.minPrice;
    }
    if (query.maxPrice != null) {
      where.basePrice.lte = query.maxPrice;
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: buildProductOrderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: productListInclude,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(serializeProductListItem),
    total,
  };
}

export async function listAdminProducts(query: ProductListQuery) {
  const where: Prisma.ProductWhereInput = {};

  if (query.category) {
    where.category = {
      slug: query.category,
    };
  }

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: buildProductOrderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: productAdminInclude,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(serializeProductListItem),
    total,
  };
}

export async function getPublicProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: productDetailInclude,
  });

  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Product not found");
  }

  return {
    ...product,
    priceRange: getProductPriceRange(product),
  };
}

export async function getAdminProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productDetailInclude,
  });

  if (!product) {
    throw new AppError(404, "NOT_FOUND", "Product not found");
  }

  return {
    ...product,
    priceRange: getProductPriceRange(product),
  };
}
