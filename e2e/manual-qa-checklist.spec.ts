import { expect, test, type Page } from "@playwright/test";

import {
  createCustomerCredentials,
  login,
  logout,
  registerCustomer,
} from "./helpers";

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin12345!";

function buildVoucherCode() {
  return `QA${Date.now().toString().slice(-8)}`;
}

function buildPromotionPayload(code: string) {
  const validFrom = new Date();
  const validUntil = new Date(validFrom.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    code,
    type: "PERCENTAGE",
    value: 10,
    minPurchase: null,
    maxDiscountCap: 100000,
    validFrom: validFrom.toISOString(),
    validUntil: validUntil.toISOString(),
    totalUsageLimit: 20,
    perUserUsageLimit: 1,
    isActive: true,
    isStackable: false,
    scopes: [{ scopeType: "ALL_PRODUCTS", targetId: null }],
  };
}

async function createVoucherAsAdmin(page: Page, code: string) {
  const result = await page.evaluate(async (payload) => {
    const response = await fetch("/api/admin/promotions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => null);

    return {
      ok: response.ok,
      status: response.status,
      body,
    };
  }, buildPromotionPayload(code));

  expect(result.ok, `promotion creation failed with status ${result.status}`).toBeTruthy();
}

function extractVariantIdFromText(value: string | null) {
  const match = value?.match(/Variant ID:\s*([a-z0-9]+)/i);

  if (!match?.[1]) {
    throw new Error("Variant ID could not be parsed from the inventory card");
  }

  return match[1];
}

test.setTimeout(180_000);

test("manual QA checklist covers customer and admin operational flows", async ({ page }) => {
  const voucherCode = buildVoucherCode();
  const customer = createCustomerCredentials("manual-qa");

  await login(page, {
    email: adminEmail,
    password: adminPassword,
  });
  await expect(page).toHaveURL(/\/admin$/);
  await createVoucherAsAdmin(page, voucherCode);
  await logout(page);
  await expect(page).toHaveURL(/\/login$/);

  await registerCustomer(page, customer);
  await logout(page);
  await expect(page).toHaveURL("/");

  await login(page, {
    email: customer.email,
    password: customer.password,
  });
  await expect(page).toHaveURL(/\/orders$/);

  await page.goto("/products?search=coffee&category=beverages");
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Artisan Coffee Beans/i })).toBeVisible();

  await page.goto("/products/artisan-coffee-beans");
  const variantSelect = page.getByLabel("Variant");

  await expect(variantSelect).toBeVisible();
  await variantSelect.selectOption({ index: 1 });
  await expect(page.getByText("Selected variant: Size: 1kg")).toBeVisible();
  await expect(page.getByText("SKU: COFFEE-1KG")).toBeVisible();

  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByText("Artisan Coffee Beans added to cart")).toBeVisible();
  await page.getByRole("link", { name: "Open Cart" }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByText("Size: 1kg")).toBeVisible();

  const cartArticle = page.locator("article").filter({ hasText: "Artisan Coffee Beans" }).first();

  await cartArticle.getByRole("button", { name: "+" }).click();
  await expect(cartArticle).toContainText("Rp 840.000");

  await page.getByRole("link", { name: "Continue to Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(
    page.getByRole("heading", { name: "Summary now comes from the live checkout module" }),
  ).toBeVisible();

  await page.getByLabel("Voucher Codes").fill(voucherCode);
  await page.getByRole("button", { name: "Refresh Preview" }).click();
  await expect(page.getByText(new RegExp(`${voucherCode} applied`))).toBeVisible();

  await page.getByLabel("Recipient Name").fill("Manual QA Customer");
  await page.getByLabel("Phone").fill("+628123456789");
  await page.getByLabel("Address Line 1").fill("Jl. QA No. 123");
  await page.getByLabel("City").fill("Jakarta");
  await page.getByRole("button", { name: "Place Order" }).click();

  await expect(page).toHaveURL(/\/orders\/.+$/);
  const orderHeading = page.locator("h1").filter({ hasText: /^ORD-/ }).first();
  const orderNumber = (await orderHeading.textContent())?.trim();

  if (!orderNumber) {
    throw new Error("Order number was not rendered on the order detail page");
  }

  await expect(page.getByRole("heading", { name: orderNumber })).toBeVisible();
  await expect(page.getByText(/^Pending Payment$/).first()).toBeVisible();

  await page.getByLabel("File Path or URL").fill(
    `https://cdn.example.com/manual-qa/${customer.email}.jpg`,
  );
  await page.getByLabel("File Name").fill("manual-qa-proof.jpg");
  await page.getByLabel("File Size in Bytes").fill("245000");
  await page.getByLabel("Note").fill("Manual QA payment proof upload");
  await page.getByRole("button", { name: "Upload Proof" }).click();

  await expect(page.getByText(/^Payment Review$/).first()).toBeVisible();
  await expect(page.getByText(/^Submitted$/).first()).toBeVisible();

  await logout(page);
  await login(page, {
    email: adminEmail,
    password: adminPassword,
  });
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/payments");
  const paymentCard = page.getByTestId(`payment-card-${orderNumber}`);

  await expect(paymentCard).toBeVisible();
  await paymentCard.getByLabel("Decision").selectOption("CONFIRMED");
  await paymentCard.getByLabel("Note").fill("Manual QA admin confirmation");
  await paymentCard.getByRole("button", { name: "Submit Review" }).click();
  await expect(page.getByRole("heading", { name: orderNumber })).toHaveCount(0);

  await page.goto("/admin/inventory");
  const lowStockVariantIdText = page.getByText(/Variant ID:/).first();
  const variantId = extractVariantIdFromText(await lowStockVariantIdText.textContent());

  await page.getByLabel("Variant ID").fill(variantId);
  await page.getByLabel("Quantity").fill("2");
  await page.getByLabel("Reason").fill(`Manual QA adjustment for ${orderNumber}`);
  await page.getByRole("button", { name: "Submit Adjustment" }).click();
  await expect(page.getByText(/Stock updated\./)).toBeVisible();

  await page.goto("/admin/settings");
  const storeNameInput = page.getByTestId("setting-input-STORE_NAME");
  const originalStoreName = await storeNameInput.inputValue();
  const nextStoreName = `${originalStoreName} QA`;

  await storeNameInput.fill(nextStoreName);
  await page.getByRole("button", { name: "Save Settings" }).click();
  await expect(page.getByText(/Saved \d+ setting\(s\)/)).toBeVisible();
  await expect(storeNameInput).toHaveValue(nextStoreName);

  await storeNameInput.fill(originalStoreName);
  await page.getByRole("button", { name: "Save Settings" }).click();
  await expect(page.getByText(/Saved \d+ setting\(s\)/)).toBeVisible();
  await expect(storeNameInput).toHaveValue(originalStoreName);
});
