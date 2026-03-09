import { expect, type Page } from "@playwright/test";

export const E2E_SEED_PRODUCT = {
  slug: "e2e-checkout-coffee",
  name: "E2E Checkout Coffee",
  categorySlug: "beverages",
  searchTerm: "e2e",
  featuredVariantLabel: "Size: 1kg",
  featuredVariantSku: "E2E-COFFEE-1KG",
} as const;

export interface CustomerCredentials {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export function createCustomerCredentials(prefix: string): CustomerCredentials {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    email: `${prefix}.${token}@example.com`,
    password: "Password123!",
    name: `E2E ${prefix} ${token.slice(-6)}`,
    phone: "+628123456789",
  };
}

export async function registerCustomer(page: Page, customer: CustomerCredentials) {
  await page.goto("/register");
  await page.getByLabel("Name").fill(customer.name);
  await page.getByLabel("Email").fill(customer.email);
  await page.getByLabel("Phone").fill(customer.phone);
  await page.getByLabel("Password").fill(customer.password);
  await page.locator("form").getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/orders$/);
}

export async function login(page: Page, input: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(input.email);
  await page.getByLabel("Password").fill(input.password);
  await page.locator("form").getByRole("button", { name: "Login" }).click();
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Logout" }).click();
}

export async function addSeedProductToCart(page: Page) {
  await page.goto(`/products/${E2E_SEED_PRODUCT.slug}`);
  await expect(
    page.getByRole("heading", { name: E2E_SEED_PRODUCT.name }),
  ).toBeVisible();

  const variantSelect = page.getByLabel("Variant");
  const optionCount = await variantSelect.locator("option").count();
  let added = false;

  for (let index = optionCount - 1; index >= 0; index -= 1) {
    await variantSelect.selectOption({ index });
    await page.getByRole("button", { name: "Add to Cart" }).click();

    try {
      await expect(
        page.getByText(`${E2E_SEED_PRODUCT.name} added to cart`),
      ).toBeVisible({ timeout: 2_500 });
      added = true;
      break;
    } catch {
      continue;
    }
  }

  if (!added) {
    throw new Error("Seed product could not be added to cart with any active variant");
  }

  await page.getByRole("link", { name: "Open Cart" }).click();
  await expect(page).toHaveURL(/\/cart$/);
}

export async function placeOrderFromCheckout(page: Page) {
  await page.getByRole("link", { name: "Continue to Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole("button", { name: "Place Order" })).toBeVisible();

  await page.getByLabel("Recipient Name").fill("E2E Customer");
  await page.getByLabel("Phone").fill("+628123456789");
  await page.getByLabel("Address Line 1").fill("Jl. Testing No. 1");
  await page.getByLabel("City").fill("Jakarta");
  await page.getByRole("button", { name: "Place Order" }).click();

  await expect(page).toHaveURL(/\/orders\/.+$/);
  const orderId = new URL(page.url()).pathname.split("/").at(-1);
  const orderHeading = page.locator("h1").filter({ hasText: /^ORD-/ }).first();

  await expect(orderHeading).toBeVisible();

  const orderNumber = (await orderHeading.textContent())?.trim();

  if (!orderNumber) {
    throw new Error("Order number was not rendered on the order detail page");
  }

  return {
    orderId,
    orderNumber,
    orderPath: page.url().replace("http://127.0.0.1:3100", ""),
  };
}
