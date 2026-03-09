import { hash } from "bcryptjs";
import { config as loadEnv } from "dotenv";
import { PrismaClient, UserRole } from "@prisma/client";

import { getDefaultStoreConfigSeedData } from "../src/server/store-config";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const prisma = new PrismaClient();

const defaultStoreConfigs = getDefaultStoreConfigSeedData();
const e2eEmailPrefixes = ["payment-review.", "storefront.", "manual-qa."] as const;

async function cleanupE2eArtifacts() {
  const e2eUsers = await prisma.user.findMany({
    where: {
      OR: e2eEmailPrefixes.map((prefix) => ({
        email: {
          startsWith: prefix,
        },
      })),
    },
    select: {
      id: true,
    },
  });
  const userIds = e2eUsers.map((user) => user.id);

  if (!userIds.length) {
    return;
  }

  await prisma.order.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });
  await prisma.address.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });
  await prisma.cart.deleteMany({
    where: {
      userId: {
        in: userIds,
      },
    },
  });
  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
}

async function seedStoreConfig() {
  for (const config of defaultStoreConfigs) {
    await prisma.storeConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, label: config.label },
      create: config,
    });
  }
}

async function seedAdminUser() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Store Admin";
  const adminPhone = process.env.SEED_ADMIN_PHONE ?? "+6280000000000";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin12345!";
  const passwordHash = await hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRole.ADMIN,
      name: adminName,
      phone: adminPhone,
      password: passwordHash,
    },
    create: {
      role: UserRole.ADMIN,
      email: adminEmail,
      name: adminName,
      phone: adminPhone,
      password: passwordHash,
    },
  });
}

async function findOrCreateOptionDefinition(productId: string, name: string, position: number) {
  const existingDefinition = await prisma.productOptionDefinition.findFirst({
    where: {
      productId,
      name,
    },
  });

  if (existingDefinition) {
    return prisma.productOptionDefinition.update({
      where: {
        id: existingDefinition.id,
      },
      data: {
        position,
      },
    });
  }

  return prisma.productOptionDefinition.create({
    data: {
      productId,
      name,
      position,
    },
  });
}

async function findOrCreateOptionValue(optionDefinitionId: string, value: string) {
  const existingValue = await prisma.productOptionValue.findFirst({
    where: {
      optionDefinitionId,
      value,
    },
  });

  if (existingValue) {
    return existingValue;
  }

  return prisma.productOptionValue.create({
    data: {
      optionDefinitionId,
      value,
    },
  });
}

async function syncVariantOptionCombination(variantId: string, optionValueId: string) {
  await prisma.variantOptionCombination.upsert({
    where: {
      variantId_optionValueId: {
        variantId,
        optionValueId,
      },
    },
    update: {},
    create: {
      variantId,
      optionValueId,
    },
  });
}

async function seedSizedCoffeeProduct(input: {
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  mediaUrl: string;
  basePrice: number;
  promoPrice: number;
  variant250Sku: string;
  variant250Stock: number;
  variant1kgSku: string;
  variant1kgPriceOverride: number;
  variant1kgStock: number;
}) {
  const product = await prisma.product.upsert({
    where: {
      slug: input.slug,
    },
    update: {
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      basePrice: input.basePrice,
      promoPrice: input.promoPrice,
      isActive: true,
      mediaUrls: [input.mediaUrl],
    },
    create: {
      categoryId: input.categoryId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      basePrice: input.basePrice,
      promoPrice: input.promoPrice,
      isActive: true,
      mediaUrls: [input.mediaUrl],
    },
  });
  const sizeDefinition = await findOrCreateOptionDefinition(product.id, "Size", 0);
  const size250g = await findOrCreateOptionValue(sizeDefinition.id, "250g");
  const size1kg = await findOrCreateOptionValue(sizeDefinition.id, "1kg");
  const variant250g = await prisma.productVariant.upsert({
    where: {
      sku: input.variant250Sku,
    },
    update: {
      productId: product.id,
      priceOverride: null,
      stockOnHand: input.variant250Stock,
      isActive: true,
    },
    create: {
      productId: product.id,
      sku: input.variant250Sku,
      stockOnHand: input.variant250Stock,
      isActive: true,
    },
  });
  const variant1kg = await prisma.productVariant.upsert({
    where: {
      sku: input.variant1kgSku,
    },
    update: {
      productId: product.id,
      priceOverride: input.variant1kgPriceOverride,
      stockOnHand: input.variant1kgStock,
      isActive: true,
    },
    create: {
      productId: product.id,
      sku: input.variant1kgSku,
      priceOverride: input.variant1kgPriceOverride,
      stockOnHand: input.variant1kgStock,
      isActive: true,
    },
  });

  await syncVariantOptionCombination(variant250g.id, size250g.id);
  await syncVariantOptionCombination(variant1kg.id, size1kg.id);
}

async function seedCatalog() {
  const beverages = await prisma.category.upsert({
    where: { slug: "beverages" },
    update: { name: "Beverages", isActive: true },
    create: { name: "Beverages", slug: "beverages", isActive: true },
  });

  const apparel = await prisma.category.upsert({
    where: { slug: "apparel" },
    update: { name: "Apparel", isActive: true },
    create: { name: "Apparel", slug: "apparel", isActive: true },
  });

  const homeGoods = await prisma.category.upsert({
    where: { slug: "home-goods" },
    update: { name: "Home Goods", isActive: true },
    create: { name: "Home Goods", slug: "home-goods", isActive: true },
  });

  await seedSizedCoffeeProduct({
    categoryId: beverages.id,
    slug: "artisan-coffee-beans",
    name: "Artisan Coffee Beans",
    description: "Medium roast blend untuk baseline storefront dan checkout.",
    mediaUrl: "/images/mock/coffee-beans.jpg",
    basePrice: 135000,
    promoPrice: 120000,
    variant250Sku: "COFFEE-250G",
    variant250Stock: 12,
    variant1kgSku: "COFFEE-1KG",
    variant1kgPriceOverride: 420000,
    variant1kgStock: 5,
  });
  await seedSizedCoffeeProduct({
    categoryId: beverages.id,
    slug: "e2e-checkout-coffee",
    name: "E2E Checkout Coffee",
    description: "Dedicated fixture product for isolated storefront and admin E2E coverage.",
    mediaUrl: "/images/mock/coffee-beans.jpg",
    basePrice: 135000,
    promoPrice: 120000,
    variant250Sku: "E2E-COFFEE-250G",
    variant250Stock: 12,
    variant1kgSku: "E2E-COFFEE-1KG",
    variant1kgPriceOverride: 420000,
    variant1kgStock: 5,
  });

  const existingShirt = await prisma.product.findUnique({
    where: { slug: "linen-weekend-shirt" },
  });

  if (!existingShirt) {
    await prisma.product.create({
      data: {
        categoryId: apparel.id,
        name: "Linen Weekend Shirt",
        slug: "linen-weekend-shirt",
        description: "Representative apparel item untuk admin catalog dan storefront list.",
        basePrice: 289000,
        isActive: true,
        mediaUrls: ["/images/mock/linen-shirt.jpg"],
        variants: {
          create: [
            {
              sku: "SHIRT-S",
              stockOnHand: 7,
              isActive: true,
            },
            {
              sku: "SHIRT-M",
              stockOnHand: 6,
              isActive: true,
            },
            {
              sku: "SHIRT-L",
              stockOnHand: 4,
              isActive: true,
            },
          ],
        },
      },
    });
  }

  const existingDeskSet = await prisma.product.findUnique({
    where: { slug: "ceramic-desk-set" },
  });

  if (!existingDeskSet) {
    await prisma.product.create({
      data: {
        categoryId: homeGoods.id,
        name: "Ceramic Desk Set",
        slug: "ceramic-desk-set",
        description: "Mock home goods item untuk baseline cart, order, dan admin inventory.",
        basePrice: 420000,
        isActive: true,
        mediaUrls: ["/images/mock/ceramic-desk-set.jpg"],
        variants: {
          create: [
            {
              sku: "DESK-SET-01",
              stockOnHand: 3,
              isActive: true,
            },
          ],
        },
      },
    });
  }
}

async function main() {
  await cleanupE2eArtifacts();
  await seedStoreConfig();
  await seedAdminUser();
  await seedCatalog();

  const [storeConfigCount, categoryCount, productCount, adminCount] = await Promise.all([
    prisma.storeConfig.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: UserRole.ADMIN } }),
  ]);

  console.log(
    `Prisma seed complete. storeConfigs=${storeConfigCount} categories=${categoryCount} products=${productCount} admins=${adminCount}`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Prisma seed failed.", error);
    await prisma.$disconnect();
    process.exit(1);
  });
