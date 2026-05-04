import type { Metadata } from "next";

import type { DomainDocPageContent } from "./shared";

export const dashboardMetadata: Metadata = {
  title: "Admin Dashboard | E-Commerce Engine Docs",
  description:
    "Operational metrics, KPIs, and recent activity for admin users.",
};

export const dashboardPageContent: DomainDocPageContent = {
  eyebrow: "Commerce Domains",
  title: "Admin Dashboard",
  description: "Operational metrics, KPIs, and recent activity for admin users.",
  status: "stable",
  currentHref: "/docs/domains/dashboard",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            "The admin dashboard provides a centralized view of operational metrics and recent activity. It surfaces the following data points:",
          ],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>Recent orders</strong> - Latest orders across all statuses
              for quick review and action.
            </>,
            <>
              <strong>Payment review queue</strong> - Payments in{" "}
              <code>SUBMITTED</code> or <code>UNDER_REVIEW</code> that require
              attention.
            </>,
            <>
              <strong>Low-stock variants</strong> - Product variants below the
              configured threshold so admins can restock proactively.
            </>,
            <>
              <strong>Recent audit logs</strong> - Latest administrative actions
              across the system.
            </>,
            <>
              <strong>User counts</strong> - Total registered users and role
              breakdowns.
            </>,
            <>
              <strong>Config completeness</strong> - Whether all required store
              configuration keys are populated.
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
          items: [
            <>
              The dashboard is powered by a single aggregation function:{" "}
              <code>getAdminDashboardSummary</code>. It queries across orders,
              payments, inventory, audit logs, users, and store configuration to
              assemble one operational summary payload.
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
              path: "/api/admin/dashboard",
              summary: "Retrieve the admin dashboard summary with metrics, recent activity, and alerts",
              access: "Admin",
            },
          ],
        },
      ],
    },
  ],
};
