import { headers } from "next/headers";
import { Prisma } from "@prisma/client";

import {
  type AuditActorType,
  type AuditContextType,
  type AuditEntityType,
} from "@/shared/contracts";
import { prisma } from "@/server/db";
import { REQUEST_ID_HEADER } from "@/server/observability";

type AuditDbClient = Prisma.TransactionClient | typeof prisma;

type AuditActorInput = {
  type: AuditActorType;
  id?: string | null;
  label?: string | null;
};

type AuditResourceInput<TType extends AuditEntityType | AuditContextType> = {
  type: TType;
  id: string;
  label?: string | null;
};

export interface WriteAuditLogInput {
  actor: AuditActorInput;
  entity: AuditResourceInput<AuditEntityType>;
  action: string;
  context?: AuditResourceInput<AuditContextType> | null;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  metadata?: Prisma.InputJsonValue | null;
  requestId?: string | null;
}

async function getRequestIdFromCurrentContext() {
  try {
    const headerStore = await headers();

    return headerStore.get(REQUEST_ID_HEADER);
  } catch {
    return null;
  }
}

async function resolveActorLabel(db: AuditDbClient, actor: AuditActorInput) {
  if (actor.label) {
    return actor.label;
  }

  if (actor.type === "SYSTEM") {
    return "System";
  }

  if (!actor.id) {
    return null;
  }

  if (!("user" in db) || !db.user || typeof db.user.findUnique !== "function") {
    return actor.id;
  }

  const user = await db.user.findUnique({
    where: {
      id: actor.id,
    },
    select: {
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return actor.id;
  }

  return user.name ? `${user.name} (${user.role})` : user.email ?? actor.id;
}

export async function writeAuditLog(
  db: AuditDbClient,
  input: WriteAuditLogInput,
) {
  const [actorLabel, requestId] = await Promise.all([
    resolveActorLabel(db, input.actor),
    input.requestId === undefined ? getRequestIdFromCurrentContext() : input.requestId,
  ]);

  return db.auditLog.create({
    data: {
      actorType: input.actor.type,
      actorId: input.actor.id ?? null,
      actorLabel,
      entityType: input.entity.type,
      entityId: input.entity.id,
      entityLabel: input.entity.label ?? null,
      contextType: input.context?.type ?? null,
      contextId: input.context?.id ?? null,
      contextLabel: input.context?.label ?? null,
      action: input.action,
      beforeJson: input.before ?? undefined,
      afterJson: input.after ?? undefined,
      metadata: input.metadata ?? undefined,
      requestId: requestId ?? null,
    },
  });
}
