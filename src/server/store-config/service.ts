import { StoreConfigKeys } from "@/shared/contracts";
import { prisma } from "@/server/db";
import { getStoreConfigDefinition } from "@/server/store-config/defaults";

type StoreConfigReader = Pick<typeof prisma, "storeConfig">;

export async function getStoreConfigSnapshot(
  keys: string[],
  db: StoreConfigReader = prisma,
) {
  const configs = await db.storeConfig.findMany({
    where: {
      key: {
        in: keys,
      },
    },
  });

  return new Map(configs.map((config) => [config.key, config.value]));
}

export function getStoreConfigNumberValue(
  snapshot: Map<string, string>,
  key: string,
  defaultValue: number,
) {
  const rawValue = snapshot.get(key);

  if (!rawValue) {
    return defaultValue;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  return Number.isNaN(parsedValue) ? defaultValue : parsedValue;
}

export function getStoreConfigTextValue(
  snapshot: Map<string, string>,
  key: string,
  defaultValue: string,
) {
  const rawValue = snapshot.get(key)?.trim();

  return rawValue || defaultValue;
}

export function getStoreConfigBooleanValue(
  snapshot: Map<string, string>,
  key: string,
  defaultValue: boolean,
) {
  const rawValue = snapshot.get(key);

  if (rawValue == null) {
    return defaultValue;
  }

  return rawValue === "true";
}

export async function getStoreRuntimeConfig(db: StoreConfigReader = prisma) {
  const snapshot = await getStoreConfigSnapshot(
    [
      StoreConfigKeys.STORE_NAME,
      StoreConfigKeys.CURRENCY,
      StoreConfigKeys.TIMEZONE,
      StoreConfigKeys.PAYMENT_TRANSFER_INSTRUCTIONS,
    ],
    db,
  );

  return {
    storeName: getStoreConfigTextValue(
      snapshot,
      StoreConfigKeys.STORE_NAME,
      getStoreConfigDefinition(StoreConfigKeys.STORE_NAME)?.defaultValue ?? "My Store",
    ),
    currency: getStoreConfigTextValue(
      snapshot,
      StoreConfigKeys.CURRENCY,
      getStoreConfigDefinition(StoreConfigKeys.CURRENCY)?.defaultValue ?? "IDR",
    ),
    timezone: getStoreConfigTextValue(
      snapshot,
      StoreConfigKeys.TIMEZONE,
      getStoreConfigDefinition(StoreConfigKeys.TIMEZONE)?.defaultValue ?? "Asia/Jakarta",
    ),
    paymentTransferInstructions: getStoreConfigTextValue(
      snapshot,
      StoreConfigKeys.PAYMENT_TRANSFER_INSTRUCTIONS,
      getStoreConfigDefinition(StoreConfigKeys.PAYMENT_TRANSFER_INSTRUCTIONS)?.defaultValue ??
        "Transfer ke rekening toko yang sudah ditentukan.",
    ),
  };
}
