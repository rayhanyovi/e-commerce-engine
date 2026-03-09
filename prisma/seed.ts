import { hash } from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

import { getDefaultStoreConfigSeedData } from "../src/server/store-config";

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

  const coffeeProduct = await prisma.product.upsert({
    where: {
      slug: "artisan-coffee-beans",
    },
    update: {
      categoryId: beverages.id,
      name: "Artisan Coffee Beans",
      description: "Medium roast blend untuk baseline storefront dan checkout.",
      basePrice: 135000,
      promoPrice: 120000,
      isActive: true,
      mediaUrls: ["/images/mock/coffee-beans.jpg"],
    },
    create: {
      categoryId: beverages.id,
      name: "Artisan Coffee Beans",
      slug: "artisan-coffee-beans",
      description: "Medium roast blend untuk baseline storefront dan checkout.",
      basePrice: 135000,
      promoPrice: 120000,
      isActive: true,
      mediaUrls: ["/images/mock/coffee-beans.jpg"],
    },
  });
  const sizeDefinition = await findOrCreateOptionDefinition(
    coffeeProduct.id,
    "Size",
    0,
  );
  const size250g = await findOrCreateOptionValue(sizeDefinition.id, "250g");
  const size1kg = await findOrCreateOptionValue(sizeDefinition.id, "1kg");
  const coffee250g = await prisma.productVariant.upsert({
    where: {
      sku: "COFFEE-250G",
    },
    update: {
      productId: coffeeProduct.id,
      priceOverride: null,
      stockOnHand: 12,
      isActive: true,
    },
    create: {
      productId: coffeeProduct.id,
      sku: "COFFEE-250G",
      stockOnHand: 12,
      isActive: true,
    },
  });
  const coffee1kg = await prisma.productVariant.upsert({
    where: {
      sku: "COFFEE-1KG",
    },
    update: {
      productId: coffeeProduct.id,
      priceOverride: 420000,
      stockOnHand: 5,
      isActive: true,
    },
    create: {
      productId: coffeeProduct.id,
      sku: "COFFEE-1KG",
      priceOverride: 420000,
      stockOnHand: 5,
      isActive: true,
    },
  });

  await syncVariantOptionCombination(coffee250g.id, size250g.id);
  await syncVariantOptionCombination(coffee1kg.id, size1kg.id);

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
