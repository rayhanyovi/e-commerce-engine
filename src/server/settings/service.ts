import { Prisma } from "@prisma/client";

import {
  ErrorCodes,
  type BulkUpdateStoreConfigDto,
  type StoreConfigKey,
} from "@/shared/contracts";
import { prisma } from "@/server/db";
import { AppError } from "@/server/http";
import {
  DEFAULT_STORE_CONFIG_DEFINITIONS,
  getDefaultStoreConfigSeedData,
  getStoreConfigDefinition,
  type StoreConfigInputKind,
  type StoreConfigSection,
} from "@/server/store-config";
import { writeAuditLog } from "@/server/audit";

type SettingsDbClient = Prisma.TransactionClient | typeof prisma;

const storeConfigSelect = {
  id: true,
  key: true,
  value: true,
  label: true,
  updatedAt: true,
} satisfies Prisma.StoreConfigSelect;

const sectionMeta: Record<
  StoreConfigSection,
  {
    title: string;
    description: string;
  }
> = {
  general: {
    title: "General",
    description: "Store identity and operational defaults that describe this engine instance.",
  },
  checkout: {
    title: "Checkout",
    description: "Voucher policy and authenticated checkout rules consumed by the live checkout flow.",
  },
  shipping: {
    title: "Shipping",
    description: "Flat shipping defaults and free-shipping threshold used during quote calculation.",
  },
  payment: {
    title: "Payments",
    description: "Manual transfer instructions used by the payment instruction and review flow.",
  },
};

export interface AdminStoreConfigEntry {
  key: StoreConfigKey;
  label: string;
  description: string;
  section: StoreConfigSection;
  input: StoreConfigInputKind;
  value: string;
  defaultValue: string;
  isMissing: boolean;
  usedBy: string[];
  updatedAt: string | null;
}

export interface AdminStoreConfigSection {
  id: StoreConfigSection;
  title: string;
  description: string;
  configs: AdminStoreConfigEntry[];
}

export interface AdminStoreConfigSnapshot {
  configs: AdminStoreConfigEntry[];
  sections: AdminStoreConfigSection[];
  totalConfigs: number;
  missingCount: number;
  missingKeys: StoreConfigKey[];
}

function normalizeStoreConfigValue(key: StoreConfigKey, rawValue: string) {
  const definition = getStoreConfigDefinition(key);

  if (!definition) {
    throw new AppError(400, ErrorCodes.VALIDATION_ERROR, `Unknown config key ${key}`);
  }

  const trimmedValue = rawValue.trim();

  switch (definition.input) {
    case "boolean":
      if (trimmedValue !== "true" && trimmedValue !== "false") {
        throw new AppError(
          400,
          ErrorCodes.VALIDATION_ERROR,
          `${definition.label} must be either true or false`,
        );
      }

      return trimmedValue;

    case "number": {
      if (!/^\d+$/.test(trimmedValue)) {
        throw new AppError(
          400,
          ErrorCodes.VALIDATION_ERROR,
          `${definition.label} must be a non-negative integer`,
        );
      }

      const parsedValue = Number.parseInt(trimmedValue, 10);

      if (
        key === "MAX_VOUCHERS_PER_ORDER" ||
        key === "INTERNAL_FLAT_SHIPPING_ETA_DAYS"
      ) {
        if (parsedValue < 1) {
          throw new AppError(
            400,
            ErrorCodes.VALIDATION_ERROR,
            `${definition.label} must be at least 1`,
          );
        }
      }

      return String(parsedValue);
    }

    case "textarea":
    case "text":
      if (!trimmedValue) {
        throw new AppError(
          400,
          ErrorCodes.VALIDATION_ERROR,
          `${definition.label} cannot be empty`,
        );
      }

      return trimmedValue;

    default:
      return trimmedValue;
  }
}

async function buildAdminStoreConfigSnapshot(
  db: SettingsDbClient = prisma,
): Promise<AdminStoreConfigSnapshot> {
  const records = await db.storeConfig.findMany({
    where: {
      key: {
        in: DEFAULT_STORE_CONFIG_DEFINITIONS.map((definition) => definition.key),
      },
    },
    select: storeConfigSelect,
  });
  const recordMap = new Map(
    records.map((record) => [record.key as StoreConfigKey, record]),
  );
  const configs = DEFAULT_STORE_CONFIG_DEFINITIONS.map((definition) => {
    const record = recordMap.get(definition.key);

    return {
      key: definition.key,
      label: definition.label,
      description: definition.description,
      section: definition.section,
      input: definition.input,
      value: record?.value ?? definition.defaultValue,
      defaultValue: definition.defaultValue,
      isMissing: !record,
      usedBy: definition.usedBy,
      updatedAt: record?.updatedAt.toISOString() ?? null,
    } satisfies AdminStoreConfigEntry;
  });
  const missingKeys = configs
    .filter((config) => config.isMissing)
    .map((config) => config.key);
  const sections = Object.entries(sectionMeta).map(([sectionId, meta]) => ({
    id: sectionId as StoreConfigSection,
    title: meta.title,
    description: meta.description,
    configs: configs.filter((config) => config.section === sectionId),
  }));

  return {
    configs,
    sections,
    totalConfigs: configs.length,
    missingCount: missingKeys.length,
    missingKeys,
  };
}

export async function listAdminStoreConfigs(db: SettingsDbClient = prisma) {
  return buildAdminStoreConfigSnapshot(db);
}

export async function initializeMissingStoreConfigs(actorId?: string) {
  return prisma.$transaction(async (tx) => {
    const existingConfigs = await tx.storeConfig.findMany({
      where: {
        key: {
          in: DEFAULT_STORE_CONFIG_DEFINITIONS.map((definition) => definition.key),
        },
      },
      select: storeConfigSelect,
    });
    const existingKeys = new Set(existingConfigs.map((config) => config.key));
    const missingConfigs = getDefaultStoreConfigSeedData().filter(
      (config) => !existingKeys.has(config.key),
    );

    if (missingConfigs.length) {
      await tx.storeConfig.createMany({
        data: missingConfigs,
      });

      for (const config of missingConfigs) {
        await writeAuditLog(tx, {
          actor: {
            type: actorId ? "ADMIN" : "SYSTEM",
            id: actorId ?? null,
          },
          entity: {
            type: "STORE_CONFIG",
            id: config.key,
            label: config.label ?? config.key,
          },
          action: "STORE_CONFIG_INITIALIZED",
          after: {
            key: config.key,
            value: config.value,
            label: config.label,
          },
        });
      }
    }

    const snapshot = await buildAdminStoreConfigSnapshot(tx);

    return {
      ...snapshot,
      createdCount: missingConfigs.length,
      createdKeys: missingConfigs.map((config) => config.key as StoreConfigKey),
    };
  });
}

export async function bulkUpdateStoreConfigs(
  dto: BulkUpdateStoreConfigDto,
  actorId?: string,
) {
  const updates = new Map(dto.configs.map((config) => [config.key, config]));

  return prisma.$transaction(async (tx) => {
    const existingConfigs = await tx.storeConfig.findMany({
      where: {
        key: {
          in: Array.from(updates.keys()),
        },
      },
      select: storeConfigSelect,
    });
    const existingMap = new Map(
      existingConfigs.map((config) => [config.key as StoreConfigKey, config]),
    );
    let updatedCount = 0;
    let createdCount = 0;

    for (const [key, update] of updates) {
      const definition = getStoreConfigDefinition(key);

      if (!definition) {
        throw new AppError(400, ErrorCodes.VALIDATION_ERROR, `Unknown config key ${key}`);
      }

      const nextValue = normalizeStoreConfigValue(key, update.value);
      const nextLabel = update.label?.trim() || definition.label;
      const existing = existingMap.get(key);
      const beforeValue = existing?.value ?? null;
      const beforeLabel = existing?.label ?? null;

      if (beforeValue === nextValue && (beforeLabel ?? definition.label) === nextLabel) {
        continue;
      }

      await tx.storeConfig.upsert({
        where: {
          key,
        },
        update: {
          value: nextValue,
          label: nextLabel,
        },
        create: {
          key,
          value: nextValue,
          label: nextLabel,
        },
      });

      await writeAuditLog(tx, {
        actor: {
          type: "ADMIN",
          id: actorId ?? null,
        },
        entity: {
          type: "STORE_CONFIG",
          id: key,
          label: nextLabel,
        },
        action: "STORE_CONFIG_UPDATED",
        before: existing
          ? {
              key,
              value: beforeValue,
              label: beforeLabel ?? definition.label,
            }
          : null,
        after: {
          key,
          value: nextValue,
          label: nextLabel,
        },
      });

      updatedCount += 1;

      if (!existing) {
        createdCount += 1;
      }
    }

    const snapshot = await buildAdminStoreConfigSnapshot(tx);

    return {
      ...snapshot,
      updatedCount,
      createdCount,
    };
  });
}
