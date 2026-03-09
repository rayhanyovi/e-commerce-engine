import { StoreConfigKeys, type StoreConfigKey } from "@/shared/contracts";

export type StoreConfigSection = "general" | "checkout" | "shipping" | "payment";
export type StoreConfigInputKind = "text" | "number" | "boolean" | "textarea";

export interface StoreConfigDefinition {
  key: StoreConfigKey;
  label: string;
  description: string;
  section: StoreConfigSection;
  input: StoreConfigInputKind;
  defaultValue: string;
  usedBy: string[];
}

export const DEFAULT_STORE_CONFIG_DEFINITIONS: StoreConfigDefinition[] = [
  {
    key: StoreConfigKeys.STORE_NAME,
    label: "Store Name",
    description: "Display name for this storefront instance.",
    section: "general",
    input: "text",
    defaultValue: "My Store",
    usedBy: ["Storefront branding", "Admin settings"],
  },
  {
    key: StoreConfigKeys.CURRENCY,
    label: "Currency",
    description: "Primary storefront currency code.",
    section: "general",
    input: "text",
    defaultValue: "IDR",
    usedBy: ["Admin settings"],
  },
  {
    key: StoreConfigKeys.TIMEZONE,
    label: "Timezone",
    description: "Default timezone for operational settings and reporting.",
    section: "general",
    input: "text",
    defaultValue: "Asia/Jakarta",
    usedBy: ["Admin settings"],
  },
  {
    key: StoreConfigKeys.MAX_VOUCHERS_PER_ORDER,
    label: "Max Vouchers Per Order",
    description: "Hard limit for the number of vouchers that can be evaluated on one order.",
    section: "checkout",
    input: "number",
    defaultValue: "1",
    usedBy: ["Promotion validation", "Checkout preview"],
  },
  {
    key: StoreConfigKeys.ALLOW_VOUCHER_STACKING,
    label: "Allow Voucher Stacking",
    description: "Determines whether multiple vouchers can be applied to one order.",
    section: "checkout",
    input: "boolean",
    defaultValue: "false",
    usedBy: ["Promotion validation", "Checkout preview"],
  },
  {
    key: StoreConfigKeys.ALLOW_VOUCHER_WITH_PRODUCT_DISCOUNT,
    label: "Allow Voucher With Product Discount",
    description: "Allows vouchers to be combined with existing product-level discounts.",
    section: "checkout",
    input: "boolean",
    defaultValue: "true",
    usedBy: ["Promotion validation", "Checkout preview"],
  },
  {
    key: StoreConfigKeys.FREE_SHIPPING_THRESHOLD,
    label: "Free Shipping Threshold",
    description: "Minimum discounted subtotal that unlocks free internal shipping.",
    section: "shipping",
    input: "number",
    defaultValue: "500000",
    usedBy: ["Checkout quote", "Shipping calculation"],
  },
  {
    key: StoreConfigKeys.INTERNAL_FLAT_SHIPPING_COST,
    label: "Flat Shipping Cost",
    description: "Fallback internal shipping fee when free shipping does not apply.",
    section: "shipping",
    input: "number",
    defaultValue: "20000",
    usedBy: ["Checkout quote", "Shipping calculation"],
  },
  {
    key: StoreConfigKeys.INTERNAL_FLAT_SHIPPING_ETA_DAYS,
    label: "Shipping ETA Days",
    description: "Default shipping ETA shown in checkout and saved to the order snapshot.",
    section: "shipping",
    input: "number",
    defaultValue: "2",
    usedBy: ["Checkout quote", "Order snapshot"],
  },
  {
    key: StoreConfigKeys.PAYMENT_TRANSFER_INSTRUCTIONS,
    label: "Payment Transfer Instructions",
    description: "Manual transfer instructions shown to the customer on the payment page.",
    section: "payment",
    input: "textarea",
    defaultValue: "Transfer ke BCA 1234567890 a/n Toko",
    usedBy: ["Payment instructions", "Payment review"],
  },
];

export function getStoreConfigDefinition(
  key: StoreConfigKey,
): StoreConfigDefinition | undefined {
  return DEFAULT_STORE_CONFIG_DEFINITIONS.find((definition) => definition.key === key);
}

export function getDefaultStoreConfigSeedData() {
  return DEFAULT_STORE_CONFIG_DEFINITIONS.map((definition) => ({
    key: definition.key,
    value: definition.defaultValue,
    label: definition.label,
  }));
}
