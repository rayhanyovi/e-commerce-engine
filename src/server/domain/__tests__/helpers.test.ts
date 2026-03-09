import {
  calculateDiscount,
  checkStockAvailability,
  getEffectivePrice,
  isPromotionEligible,
  isValidStatusTransition,
  calculateShipping,
} from "@/server/domain";

test("getEffectivePrice prefers variant override over promo and base price", () => {
  expect(
    getEffectivePrice(
      { basePrice: 150_000, promoPrice: 125_000 },
      { priceOverride: 110_000 },
    ),
  ).toBe(110_000);
});

test("getEffectivePrice falls back to promo price before base price", () => {
  expect(
    getEffectivePrice(
      { basePrice: 150_000, promoPrice: 125_000 },
      { priceOverride: null },
    ),
  ).toBe(125_000);
});

test("getEffectivePrice falls back to base price when no override or promo exists", () => {
  expect(
    getEffectivePrice(
      { basePrice: 150_000, promoPrice: null },
      { priceOverride: null },
    ),
  ).toBe(150_000);
});

test("isPromotionEligible rejects inactive promotions", () => {
  expect(
    isPromotionEligible(
      {
        id: "promo_1",
        type: "PERCENTAGE",
        value: 10,
        totalUsed: 0,
        isActive: false,
        isStackable: false,
        scopes: [],
        validFrom: new Date("2026-03-01T00:00:00.000Z"),
        validUntil: new Date("2026-03-31T23:59:59.000Z"),
      },
      new Date("2026-03-10T12:00:00.000Z"),
    ),
  ).toEqual({
    eligible: false,
    reason: "Promotion is inactive",
  });
});

test("isPromotionEligible rejects promotions outside the active window", () => {
  expect(
    isPromotionEligible(
      {
        id: "promo_2",
        type: "PERCENTAGE",
        value: 10,
        totalUsed: 0,
        isActive: true,
        isStackable: false,
        scopes: [],
        validFrom: new Date("2026-03-01T00:00:00.000Z"),
        validUntil: new Date("2026-03-31T23:59:59.000Z"),
      },
      new Date("2026-04-01T00:00:00.000Z"),
    ),
  ).toEqual({
    eligible: false,
    reason: "Promotion has expired",
  });
});

test("isPromotionEligible rejects promotions when total usage is exhausted", () => {
  expect(
    isPromotionEligible(
      {
        id: "promo_3",
        type: "FIXED_AMOUNT",
        value: 25_000,
        totalUsageLimit: 5,
        perUserUsageLimit: 2,
        totalUsed: 5,
        isActive: true,
        isStackable: false,
        scopes: [],
        validFrom: new Date("2026-03-01T00:00:00.000Z"),
        validUntil: new Date("2026-03-31T23:59:59.000Z"),
      },
      new Date("2026-03-10T12:00:00.000Z"),
      2,
    ),
  ).toEqual({
    eligible: false,
    reason: "Promotion usage limit reached",
  });
});

test("isPromotionEligible accepts an active promotion inside its constraints", () => {
  expect(
    isPromotionEligible(
      {
        id: "promo_4",
        type: "FIXED_AMOUNT",
        value: 25_000,
        totalUsageLimit: 5,
        perUserUsageLimit: 2,
        totalUsed: 1,
        isActive: true,
        isStackable: false,
        scopes: [],
        validFrom: new Date("2026-03-01T00:00:00.000Z"),
        validUntil: new Date("2026-03-31T23:59:59.000Z"),
      },
      new Date("2026-03-10T12:00:00.000Z"),
      1,
    ),
  ).toEqual({
    eligible: true,
  });
});

test("calculateDiscount caps percentage discounts when maxDiscountCap is set", () => {
  expect(
    calculateDiscount(
      {
        id: "promo_5",
        type: "PERCENTAGE",
        value: 25,
        maxDiscountCap: 30_000,
        totalUsed: 0,
        isActive: true,
        isStackable: false,
        scopes: [],
        validFrom: new Date("2026-03-01T00:00:00.000Z"),
        validUntil: new Date("2026-03-31T23:59:59.000Z"),
      },
      200_000,
    ),
  ).toBe(30_000);
});

test("calculateDiscount clamps fixed-amount discounts to subtotal", () => {
  expect(
    calculateDiscount(
      {
        id: "promo_6",
        type: "FIXED_AMOUNT",
        value: 100_000,
        totalUsed: 0,
        isActive: true,
        isStackable: false,
        scopes: [],
        validFrom: new Date("2026-03-01T00:00:00.000Z"),
        validUntil: new Date("2026-03-31T23:59:59.000Z"),
      },
      60_000,
    ),
  ).toBe(60_000);
});

test("calculateDiscount returns zero for non-price promotions", () => {
  expect(
    calculateDiscount(
      {
        id: "promo_7",
        type: "FREE_SHIPPING",
        value: 0,
        totalUsed: 0,
        isActive: true,
        isStackable: false,
        scopes: [],
        validFrom: new Date("2026-03-01T00:00:00.000Z"),
        validUntil: new Date("2026-03-31T23:59:59.000Z"),
      },
      100_000,
    ),
  ).toBe(0);
});

test("calculateShipping applies free shipping when subtotal reaches threshold", () => {
  expect(
    calculateShipping(
      {
        subtotalAfterDiscount: 500_000,
        freeShippingThreshold: 500_000,
        flatShippingCost: 20_000,
        hasFreeShippingVoucher: false,
      },
      3,
    ),
  ).toEqual({
    method: "INTERNAL_FLAT",
    cost: 0,
    etaDays: 3,
    freeShippingApplied: true,
  });
});

test("calculateShipping applies free shipping when voucher grants it", () => {
  expect(
    calculateShipping({
      subtotalAfterDiscount: 50_000,
      freeShippingThreshold: 500_000,
      flatShippingCost: 20_000,
      hasFreeShippingVoucher: true,
    }),
  ).toMatchObject({
    cost: 0,
    freeShippingApplied: true,
  });
});

test("calculateShipping keeps flat shipping cost when no free-shipping rule applies", () => {
  expect(
    calculateShipping({
      subtotalAfterDiscount: 50_000,
      freeShippingThreshold: 500_000,
      flatShippingCost: 20_000,
      hasFreeShippingVoucher: false,
    }),
  ).toMatchObject({
    cost: 20_000,
    freeShippingApplied: false,
  });
});

test("checkStockAvailability returns available when all requested quantities fit current stock", () => {
  expect(
    checkStockAvailability([
      {
        productVariantId: "variant_1",
        requestedQty: 2,
        stockOnHand: 5,
        activeReservations: 1,
      },
    ]),
  ).toEqual({
    available: true,
    unavailableItems: [],
  });
});

test("checkStockAvailability clamps unavailable quantities when reservations exceed stock", () => {
  expect(
    checkStockAvailability([
      {
        productVariantId: "variant_2",
        requestedQty: 2,
        stockOnHand: 1,
        activeReservations: 3,
      },
    ]),
  ).toEqual({
    available: false,
    unavailableItems: [
      {
        productVariantId: "variant_2",
        requestedQty: 2,
        availableQty: 0,
      },
    ],
  });
});

test("isValidStatusTransition accepts allowed transitions in the order lifecycle", () => {
  expect(isValidStatusTransition("PENDING_PAYMENT", "PAYMENT_REVIEW")).toBe(true);
  expect(isValidStatusTransition("PAID", "PROCESSING")).toBe(true);
  expect(isValidStatusTransition("SHIPPED", "COMPLETED")).toBe(true);
});

test("isValidStatusTransition rejects invalid or terminal transitions", () => {
  expect(isValidStatusTransition("PENDING_PAYMENT", "PAID")).toBe(false);
  expect(isValidStatusTransition("COMPLETED", "CANCELLED")).toBe(false);
  expect(isValidStatusTransition("CANCELLED", "PROCESSING")).toBe(false);
});
