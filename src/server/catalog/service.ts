import { Prisma, type Product } from "@prisma/client";

import {
  type CreateCategoryDto,
  type ProductListQuery,
  type UpdateCategoryDto,
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
