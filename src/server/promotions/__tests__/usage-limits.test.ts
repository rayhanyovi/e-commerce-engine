import { StoreConfigKeys } from "@/shared/contracts";

const storeConfigMocks = vi.hoisted(() => ({
  getStoreConfigBooleanValue: vi.fn(),
  getStoreConfigNumberValue: vi.fn(),
  getStoreConfigSnapshot: vi.fn(),
}));

vi.mock("@/server/store-config", () => storeConfigMocks);

import { validateVoucherSelection } from "../service";

function createPromotion(input?: {
  code?: string;
  totalUsed?: number;
  totalUsageLimit?: number | null;
  perUserUsageLimit?: number | null;
  usageUserIds?: string[];
}) {
  return {
    id: `cmfpromotion${input?.code ?? "promo"}0000000001`,
    code: input?.code ?? "PROMO10",
    type: "FIXED_AMOUNT" as const,
    value: 10000,
    minPurchase: null,
    maxDiscountCap: null,
    validFrom: new Date("2026-03-01T00:00:00.000Z"),
    validUntil: new Date("2026-03-31T23:59:59.000Z"),
    totalUsageLimit: input?.totalUsageLimit ?? null,
    perUserUsageLimit: input?.perUserUsageLimit ?? null,
    totalUsed: input?.totalUsed ?? 0,
    isActive: true,
    isStackable: true,
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
    updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    scopes: [
      {
        id: "cmfscope000000000000000001",
        promotionId: `cmfpromotion${input?.code ?? "promo"}0000000001`,
        scopeType: "ALL_PRODUCTS" as const,
        targetId: null,
      },
    ],
    usages: (input?.usageUserIds ?? []).map((userId, index) => ({
      id: `cmfusage00000000000000000${index + 1}`,
      userId,
    })),
  };
}

describe("promotion usage limits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeConfigMocks.getStoreConfigSnapshot.mockResolvedValue({});
    storeConfigMocks.getStoreConfigBooleanValue.mockImplementation(
      (_snapshot: unknown, key: string, defaultValue: boolean) => {
        if (key === StoreConfigKeys.ALLOW_VOUCHER_STACKING) {
          return true;
        }

        if (key === StoreConfigKeys.ALLOW_VOUCHER_WITH_PRODUCT_DISCOUNT) {
          return true;
        }

        return defaultValue;
      },
    );
    storeConfigMocks.getStoreConfigNumberValue.mockImplementation(
      (_snapshot: unknown, key: string, defaultValue: number) => {
        if (key === StoreConfigKeys.MAX_VOUCHERS_PER_ORDER) {
          return 3;
        }

        return defaultValue;
      },
    );
  });

  it("rejects vouchers when the total usage limit has been reached", async () => {
    const db = {
      promotion: {
        findMany: vi.fn().mockResolvedValue([
          createPromotion({
            code: "LIMITMAX",
            totalUsed: 5,
            totalUsageLimit: 5,
          }),
        ]),
      },
    };

    const result = await validateVoucherSelection(
      {
        codes: ["LIMITMAX"],
        subtotal: 200000,
        productDiscountTotal: 0,
        userId: "cmfuser000000000000000001",
        items: [
          {
            productId: "cmfproduct000000000000001",
            productVariantId: "cmfvariant000000000000001",
            categoryId: "cmfcategory00000000000001",
          },
        ],
      },
      db as never,
    );

    expect(result.appliedVouchers).toEqual([]);
    expect(result.rejectedVouchers).toEqual([
      {
        code: "LIMITMAX",
        reason: "Promotion usage limit reached",
      },
    ]);
    expect(result.voucherDiscountTotal).toBe(0);
  });

  it("rejects vouchers when the current user has reached the per-user limit", async () => {
    const db = {
      promotion: {
        findMany: vi.fn().mockResolvedValue([
          createPromotion({
            code: "PERUSER",
            perUserUsageLimit: 1,
            usageUserIds: [
              "cmfuser000000000000000001",
              "cmfotheruser0000000000001",
            ],
          }),
        ]),
      },
    };

    const result = await validateVoucherSelection(
      {
        codes: ["PERUSER"],
        subtotal: 200000,
        productDiscountTotal: 0,
        userId: "cmfuser000000000000000001",
        items: [
          {
            productId: "cmfproduct000000000000001",
            productVariantId: "cmfvariant000000000000001",
            categoryId: "cmfcategory00000000000001",
          },
        ],
      },
      db as never,
    );

    expect(result.appliedVouchers).toEqual([]);
    expect(result.rejectedVouchers).toEqual([
      {
        code: "PERUSER",
        reason: "Per-user usage limit reached",
      },
    ]);
  });

  it("keeps vouchers eligible when usage exists but stays under both caps", async () => {
    const db = {
      promotion: {
        findMany: vi.fn().mockResolvedValue([
          createPromotion({
            code: "STILLOK",
            totalUsed: 2,
            totalUsageLimit: 5,
            perUserUsageLimit: 2,
            usageUserIds: ["cmfotheruser0000000000001"],
          }),
        ]),
      },
    };

    const result = await validateVoucherSelection(
      {
        codes: ["STILLOK"],
        subtotal: 200000,
        productDiscountTotal: 0,
        userId: "cmfuser000000000000000001",
        items: [
          {
            productId: "cmfproduct000000000000001",
            productVariantId: "cmfvariant000000000000001",
            categoryId: "cmfcategory00000000000001",
          },
        ],
      },
      db as never,
    );

    expect(result.appliedVouchers).toEqual([
      {
        code: "STILLOK",
        discount: 10000,
        type: "FIXED_AMOUNT",
      },
    ]);
    expect(result.rejectedVouchers).toEqual([]);
    expect(result.voucherDiscountTotal).toBe(10000);
  });
});
