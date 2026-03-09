import { Prisma } from "@prisma/client";

import {
  type AuditLogListQuery,
  type AuditActorType,
  type AuditContextType,
  type AuditEntityType,
} from "@/shared/contracts";
import { prisma } from "@/server/db";

const auditLogInclude = {
  actor: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.AuditLogInclude;

type AuditLogRecord = Prisma.AuditLogGetPayload<{
  include: typeof auditLogInclude;
}>;

function stringifyJsonValue(value: Prisma.JsonValue | null) {
  if (value == null) {
    return null;
  }

  return JSON.stringify(value, null, 2);
}

function summarizeJsonValue(value: Prisma.JsonValue | null) {
  if (value == null) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `${value.length} item(s)`;
  }

  const entries = Object.entries(value).slice(0, 3);

  if (!entries.length) {
    return "{}";
  }

  return entries
    .map(([key, entryValue]) => `${key}: ${typeof entryValue === "string" ? entryValue : JSON.stringify(entryValue)}`)
    .join(" | ");
}

function serializeAuditLog(record: AuditLogRecord) {
  return {
    ...record,
    actorLabel: record.actorLabel
      ? record.actorLabel
      : record.actor
      ? `${record.actor.name} (${record.actor.role})`
      : record.actorId
        ? `Unknown actor ${record.actorId}`
        : record.actorType === "SYSTEM"
          ? "System"
          : "Anonymous actor",
    beforeSummary: summarizeJsonValue(record.beforeJson),
    afterSummary: summarizeJsonValue(record.afterJson),
    beforeJsonString: stringifyJsonValue(record.beforeJson),
    afterJsonString: stringifyJsonValue(record.afterJson),
    metadataString: stringifyJsonValue(record.metadata),
  };
}

function buildAuditWhere(query: AuditLogListQuery): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};

  if (query.actorType) {
    where.actorType = query.actorType;
  }

  if (query.entityType) {
    where.entityType = query.entityType;
  }

  if (query.contextType) {
    where.contextType = query.contextType;
  }

  if (query.action) {
    where.action = {
      contains: query.action,
      mode: "insensitive",
    };
  }

  if (query.search) {
    where.OR = [
      {
        entityId: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        entityLabel: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        contextId: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        contextLabel: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        action: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        requestId: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        actorId: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        actor: {
          is: {
            OR: [
              {
                name: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      },
    ];
  }

  return where;
}

export const AUDIT_ENTITY_FILTERS: AuditEntityType[] = [
  "ORDER",
  "PAYMENT",
  "PROMOTION",
  "INVENTORY",
  "STORE_CONFIG",
];

export const AUDIT_ACTOR_FILTERS: AuditActorType[] = ["ADMIN", "SYSTEM", "CUSTOMER"];

export const AUDIT_CONTEXT_FILTERS: AuditContextType[] = [
  "ORDER",
  "PAYMENT",
  "PRODUCT",
  "PRODUCT_VARIANT",
  "STORE_CONFIG",
  "PROMOTION",
  "USER",
];

export async function listAdminAuditLogs(query: AuditLogListQuery) {
  const where = buildAuditWhere(query);
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: auditLogInclude,
      orderBy: {
        createdAt: "desc",
      },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.auditLog.count({
      where,
    }),
  ]);

  return {
    logs: logs.map(serializeAuditLog),
    total,
  };
}
