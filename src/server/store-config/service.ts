import { prisma } from "@/server/db";

export async function getStoreConfigSnapshot(keys: string[]) {
  const configs = await prisma.storeConfig.findMany({
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
