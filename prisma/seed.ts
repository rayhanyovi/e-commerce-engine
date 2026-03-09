import { hash } from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

import { StoreConfigKeys } from "../src/shared/contracts/dto/store-config.dto";

const prisma = new PrismaClient();

const defaultStoreConfigs: Array<{ key: string; value: string; label: string }> = [
  { key: StoreConfigKeys.STORE_NAME, value: "My Store", label: "Store Name" },
  { key: StoreConfigKeys.CURRENCY, value: "IDR", label: "Currency" },
  { key: StoreConfigKeys.TIMEZONE, value: "Asia/Jakarta", label: "Timezone" },
  {
    key: StoreConfigKeys.ALLOW_GUEST_CHECKOUT,
    value: "false",
    label: "Allow Guest Checkout",
  },
  {
    key: StoreConfigKeys.MAX_VOUCHERS_PER_ORDER,
    value: "1",
    label: "Max Vouchers Per Order",
  },
  {
    key: StoreConfigKeys.ALLOW_VOUCHER_STACKING,
    value: "false",
    label: "Allow Voucher Stacking",
  },
  {
    key: StoreConfigKeys.ALLOW_VOUCHER_WITH_PRODUCT_DISCOUNT,
    value: "true",
    label: "Allow Voucher With Product Discount",
  },
  {
    key: StoreConfigKeys.FREE_SHIPPING_THRESHOLD,
    value: "500000",
    label: "Free Shipping Threshold (IDR)",
  },
  {
    key: StoreConfigKeys.INTERNAL_FLAT_SHIPPING_COST,
    value: "20000",
    label: "Flat Shipping Cost (IDR)",
  },
  {
    key: StoreConfigKeys.INTERNAL_FLAT_SHIPPING_ETA_DAYS,
    value: "2",
    label: "Shipping ETA (days)",
  },
  {
    key: StoreConfigKeys.PAYMENT_TRANSFER_INSTRUCTIONS,
    value: "Transfer ke BCA 1234567890 a/n Toko",
    label: "Payment Transfer Instructions",
  },
];

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

  const existingCoffee = await prisma.product.findUnique({
    where: { slug: "artisan-coffee-beans" },
  });

  if (!existingCoffee) {
    const coffeeProduct = await prisma.product.create({
      data: {
        categoryId: beverages.id,
        name: "Artisan Coffee Beans",
        slug: "artisan-coffee-beans",
        description: "Medium roast blend untuk baseline storefront dan checkout.",
        basePrice: 135000,
        promoPrice: 120000,
        isActive: true,
        mediaUrls: ["/images/mock/coffee-beans.jpg"],
        optionDefinitions: {
          create: [
            {
              name: "Size",
              position: 0,
              values: {
                create: [{ value: "250g" }, { value: "1kg" }],
              },
            },
          ],
        },
        variants: {
          create: [
            {
              sku: "COFFEE-250G",
              stockOnHand: 12,
              isActive: true,
            },
            {
              sku: "COFFEE-1KG",
              priceOverride: 420000,
              stockOnHand: 5,
              isActive: true,
            },
          ],
        },
      },
      include: {
        optionDefinitions: { include: { values: true } },
        variants: true,
      },
    });

    const sizeDefinition = coffeeProduct.optionDefinitions.find(
      (definition) => definition.name === "Size",
    );
    const size250g = sizeDefinition?.values.find((value) => value.value === "250g");
    const size1kg = sizeDefinition?.values.find((value) => value.value === "1kg");

    if (size250g && coffeeProduct.variants[0]) {
      await prisma.variantOptionCombination.create({
        data: {
          variantId: coffeeProduct.variants[0].id,
          optionValueId: size250g.id,
        },
      });
    }

    if (size1kg && coffeeProduct.variants[1]) {
      await prisma.variantOptionCombination.create({
        data: {
          variantId: coffeeProduct.variants[1].id,
          optionValueId: size1kg.id,
        },
      });
    }
  }

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
  await seedStoreConfig();
  await seedAdminUser();
  await seedCatalog();
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
