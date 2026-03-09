import { expect, test } from "@playwright/test";

import {
  addSeedProductToCart,
  createCustomerCredentials,
  placeOrderFromCheckout,
  registerCustomer,
} from "./helpers";

test("storefront happy path lets a new customer register and place an order", async ({
  page,
}) => {
  const customer = createCustomerCredentials("storefront");

  await registerCustomer(page, customer);
  await addSeedProductToCart(page);

  await expect(page.getByRole("heading", { name: /item\(s\) ready for checkout/i })).toBeVisible();

  const order = await placeOrderFromCheckout(page);

  await expect(page.getByText(order.orderNumber)).toBeVisible();
  await expect(page.getByText(/^Pending Payment$/).first()).toBeVisible();
  await expect(page.getByText(/^Pending$/).first()).toBeVisible();
  await expect(page.getByText("Payment Instructions")).toBeVisible();
});
