import type { Metadata } from "next";

import type { DomainDocPageContent } from "./shared";

export const auditMetadata: Metadata = {
  title: "Audit Logs | E-Commerce Engine Docs",
  description:
    "Comprehensive audit trail with actor tracking, entity context, and before/after snapshots.",
};

export const auditPageContent: DomainDocPageContent = {
  eyebrow: "Commerce Domains",
  title: "Audit Logs",
  description:
    "Comprehensive audit trail with actor tracking, entity context, and before/after snapshots.",
  status: "stable",
  currentHref: "/docs/domains/audit",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            "Every significant operation in the system writes an audit log entry, providing a comprehensive trail of administrative and system actions. Audited operations include order status changes, payment reviews, promotion CRUD, inventory adjustments, and store configuration updates. Audit logs are immutable and serve as the authoritative record of what happened, when, and by whom.",
          ],
        },
      ],
    },
    {
      id: "audit-structure",
      title: "Audit Structure",
      blocks: [
        {
          type: "paragraphs",
          items: ["Each audit log entry captures the following data:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>actorType</strong> - Who performed the action:{" "}
              <code>ADMIN</code>, <code>SYSTEM</code>, or <code>CUSTOMER</code>.
            </>,
            <>
              <strong>entityType</strong> - Which entity type was affected, such
              as <code>ORDER</code>, <code>PAYMENT</code>,{" "}
              <code>PROMOTION</code>, <code>INVENTORY</code>, or{" "}
              <code>STORE_CONFIG</code>.
            </>,
            <>
              <strong>contextType</strong> - Cross-reference context linking the
              entry to related entities such as a parent order when a payment is
              reviewed.
            </>,
            <>
              <strong>beforeJson / afterJson</strong> - State snapshots from
              before and after the operation for precise change inspection.
            </>,
            <>
              <strong>requestId</strong> - A unique identifier that correlates
              multiple audit entries created by one request.
            </>,
          ],
        },
      ],
    },
    {
      id: "query-filters",
      title: "Query Filters",
      blocks: [
        {
          type: "paragraphs",
          items: ["The audit log API supports rich filtering to help admins find relevant entries:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>action</strong> - Filter by the specific action performed.
            </>,
            <>
              <strong>actorId</strong> - Filter by the user who performed the
              action.
            </>,
            <>
              <strong>entityType</strong> - Filter by the type of entity
              affected.
            </>,
            <>
              <strong>entityId</strong> - Filter by a specific entity instance.
            </>,
            <>
              <strong>contextType</strong> and <strong>contextId</strong> -
              Filter by cross-reference context.
            </>,
            <>
              <strong>Free-text search</strong> - Search across actions and
              notes for keyword matches.
            </>,
          ],
        },
      ],
    },
    {
      id: "server-module",
      title: "Server Module",
      blocks: [
        {
          type: "paragraphs",
          items: ["The audit service provides the following functions:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>writeAuditLog</strong> - Writes a new audit entry and is
              called across the codebase whenever a significant event occurs.
            </>,
            <>
              <strong>listAdminAuditLogs</strong> - Retrieves audit log entries
              with pagination and the full query filter set.
            </>,
          ],
        },
      ],
    },
    {
      id: "api-endpoints",
      title: "API Endpoints",
      blocks: [
        {
          type: "routes",
          endpoints: [
            {
              method: "GET",
              path: "/api/admin/audit",
              summary: "List audit log entries with filtering by action, actor, entity, and free-text search",
              access: "Admin",
            },
          ],
        },
      ],
    },
  ],
};
