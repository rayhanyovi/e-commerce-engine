import { expect, test } from "@playwright/test";

import {
  addSeedProductToCart,
  createCustomerCredentials,
  login,
  logout,
  placeOrderFromCheckout,
  registerCustomer,
} from "./helpers";

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin12345!";

test("admin payment review path confirms a submitted proof and updates the customer order", async ({
  page,
}) => {
  const customer = createCustomerCredentials("payment-review");

  await registerCustomer(page, customer);
  await addSeedProductToCart(page);

  const order = await placeOrderFromCheckout(page);

  await page.getByLabel("File Path or URL").fill(
    `https://cdn.example.com/proofs/${customer.email}.jpg`,
  );
  await page.getByLabel("File Name").fill("proof-transfer.jpg");
  await page.getByLabel("File Size in Bytes").fill("245000");
  await page.getByLabel("Note").fill("Customer uploaded transfer proof for admin review");
  await page.getByRole("button", { name: "Upload Proof" }).click();

  await expect(page.getByText(/^Payment Review$/).first()).toBeVisible();
  await expect(page.getByText(/^Submitted$/).first()).toBeVisible();

  await logout(page);
  await expect(page).toHaveURL("/");

  await login(page, {
    email: adminEmail,
    password: adminPassword,
  });
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/payments");
  const paymentCard = page.getByTestId(`payment-card-${order.orderNumber}`);

  await expect(paymentCard).toBeVisible();
  await paymentCard.getByLabel("Decision").selectOption("CONFIRMED");
  await paymentCard.getByLabel("Note").fill("Admin confirmed E2E payment proof");
  await paymentCard.getByRole("button", { name: "Submit Review" }).click();

  await expect(
    page.getByRole("heading", { name: order.orderNumber }),
  ).toHaveCount(0);

  await logout(page);
  await login(page, {
    email: customer.email,
    password: customer.password,
  });
  await expect(page).toHaveURL(/\/orders$/);

  await page.goto(order.orderPath);
  await expect(page.getByText(/^Paid$/).first()).toBeVisible();
  await expect(page.getByText(/^Confirmed$/).first()).toBeVisible();
  await expect(
    page.getByText("Payment sudah dikonfirmasi admin, jadi proof baru tidak perlu diupload lagi."),
  ).toBeVisible();
});
