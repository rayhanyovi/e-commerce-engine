import type { Metadata } from "next";

import type { DomainDocPageContent } from "./shared";

export const addressesMetadata: Metadata = {
  title: "Addresses | E-Commerce Engine Docs",
  description: "Customer address management with default address handling.",
};

export const addressesPageContent: DomainDocPageContent = {
  eyebrow: "Commerce Domains",
  title: "Addresses",
  description: "Customer address management with default address handling.",
  status: "stable",
  currentHref: "/docs/domains/addresses",
  sections: [
    {
      id: "overview",
      title: "Overview",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              Customers can save multiple shipping addresses for checkout. Each
              address includes <code>recipientName</code>, <code>phone</code>,{" "}
              <code>addressLine1</code>, optional <code>addressLine2</code>,{" "}
              <code>district</code>, <code>city</code>, <code>postalCode</code>
              , optional delivery <code>notes</code>, and an{" "}
              <code>isDefault</code> flag. Selected addresses are snapshotted
              onto orders during checkout.
            </>,
          ],
        },
      ],
    },
    {
      id: "default-address",
      title: "Default Address",
      blocks: [
        {
          type: "paragraphs",
          items: [
            <>
              Each customer can designate one address as their default. When an
              address is saved with <code>isDefault=true</code>, the system
              automatically unsets the previous default so only one default
              exists at a time. Listing results are ordered by default status
              first and then by recency.
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
          items: ["The address service provides the following functions:"],
        },
        {
          type: "bullets",
          items: [
            <>
              <strong>listMyAddresses</strong> - Returns all addresses for the
              authenticated customer, ordered by default status and recency.
            </>,
            <>
              <strong>createAddress</strong> - Creates a new address and handles
              default flag management automatically.
            </>,
            <>
              <strong>updateAddress</strong> - Updates an existing address,
              including default flag toggling.
            </>,
            <>
              <strong>deleteAddress</strong> - Removes an address without
              affecting orders that already snapshotted it.
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
              path: "/api/addresses",
              summary: "List all saved addresses for the authenticated customer",
              access: "Customer",
            },
            {
              method: "POST",
              path: "/api/addresses",
              summary: "Create a new address with automatic default flag management",
              access: "Customer",
            },
            {
              method: "PATCH",
              path: "/api/addresses/[id]",
              summary: "Update an existing address's fields and default status",
              access: "Customer",
            },
            {
              method: "DELETE",
              path: "/api/addresses/[id]",
              summary: "Delete a saved address without affecting historical order records",
              access: "Customer",
            },
          ],
        },
      ],
    },
  ],
};
