-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('ORDER', 'PAYMENT', 'PROMOTION', 'INVENTORY', 'STORE_CONFIG');

-- CreateEnum
CREATE TYPE "AuditContextType" AS ENUM ('ORDER', 'PAYMENT', 'PRODUCT', 'PRODUCT_VARIANT', 'STORE_CONFIG', 'PROMOTION', 'USER');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "actorLabel" TEXT,
ADD COLUMN     "contextId" TEXT,
ADD COLUMN     "contextLabel" TEXT,
ADD COLUMN     "contextType" "AuditContextType",
ADD COLUMN     "entityLabel" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "AuditLog"
    WHERE "entityType" NOT IN ('ORDER', 'PAYMENT', 'PROMOTION', 'INVENTORY', 'STORE_CONFIG')
  ) THEN
    RAISE EXCEPTION 'AuditLog.entityType contains unsupported values for AuditEntityType migration';
  END IF;
END $$;

DROP INDEX IF EXISTS "AuditLog_entityType_entityId_createdAt_idx";

ALTER TABLE "AuditLog"
ALTER COLUMN "entityType" TYPE "AuditEntityType"
USING ("entityType"::text::"AuditEntityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_contextType_contextId_createdAt_idx" ON "AuditLog"("contextType", "contextId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_requestId_idx" ON "AuditLog"("requestId");
