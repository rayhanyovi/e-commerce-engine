import { expect, type Page } from "@playwright/test";

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
  await page.goto("/products/artisan-coffee-beans");
  await expect(
    page.getByRole("heading", { name: "Artisan Coffee Beans" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByText("Artisan Coffee Beans added to cart")).toBeVisible();
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
