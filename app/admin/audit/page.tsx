import Link from "next/link";

import { DataState } from "@/components/ui/data-state";
import { formatDateTime } from "@/lib/formatters";
import { toFlatSearchParams, type SearchParamInput } from "@/lib/search-params";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";
import {
  AUDIT_ACTOR_FILTERS,
  AUDIT_ENTITY_FILTERS,
  listAdminAuditLogs,
} from "@/server/audit";
import { AuditLogListQuerySchema } from "@/shared/contracts";

export const dynamic = "force-dynamic";

function buildAuditHref(
  current: Record<string, string | undefined>,
  updates: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...current, ...updates })) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();

  return query ? `/admin/audit?${query}` : "/admin/audit";
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamInput>;
}) {
  const currentSearchParams = toFlatSearchParams(await searchParams);
  const query = AuditLogListQuerySchema.parse(currentSearchParams);
  let result: Awaited<ReturnType<typeof listAdminAuditLogs>> | null = null;
  let errorMessage: string | null = null;

  try {
    result = await listAdminAuditLogs(query);
  } catch (error) {
    errorMessage = toUserFacingErrorMessage(
      error,
      "Audit log data could not be loaded right now. Try again after the database setup is ready.",
    );
  }

  if (!result) {
    return (
      <DataState
        tone="error"
        eyebrow="Audit Error"
        title="Audit page is not available"
        description={
          errorMessage ??
          "Audit log data could not be loaded right now. Try again after the database setup is ready."
        }
        actions={[
          { href: "/admin/audit", label: "Reload audit" },
          { href: "/admin", label: "Back to admin", variant: "secondary" },
        ]}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(result.total / query.pageSize));
  const hasActiveFilters = Boolean(
    query.search || query.entityType || query.actorType || query.action,
  );
  const entityTypesOnPage = new Set(result.logs.map((log) => log.entityType)).size;
  const adminActionsOnPage = result.logs.filter((log) => log.actorType === "ADMIN").length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Matched Logs</p>
          <div className="mt-3 text-3xl font-semibold">{result.total}</div>
          <p className="mt-2 text-sm text-muted">
            Audit list sekarang membaca data nyata dari audit table root Next app.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Admin Actions On Page</p>
          <div className="mt-3 text-3xl font-semibold">{adminActionsOnPage}</div>
          <p className="mt-2 text-sm text-muted">
            Customer dan system events tetap ikut tampil agar timeline operasional utuh.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Entity Types On Page</p>
          <div className="mt-3 text-3xl font-semibold">{entityTypesOnPage}</div>
          <p className="mt-2 text-sm text-muted">
            Current audit design memakai generic polymorphic log per `entityType` dan `entityId`.
          </p>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Audit Log Registry</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
              Halaman ini merangkum perubahan penting dari orders, payments, promotions,
              inventory, dan store settings. Filter bekerja server-side dan payload before/after
              tetap bisa dibuka untuk inspeksi detail.
            </p>
          </div>
          <Link
            href="/api/admin/audit"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
          >
            Inspect API
          </Link>
        </div>

        <form className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_1fr_auto]">
          <input
            name="search"
            defaultValue={query.search ?? ""}
            placeholder="Search entity, actor, request ID..."
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
          />
          <select
            name="entityType"
            defaultValue={query.entityType ?? ""}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
          >
            <option value="">All entities</option>
            {AUDIT_ENTITY_FILTERS.map((entityType) => (
              <option key={entityType} value={entityType}>
                {entityType}
              </option>
            ))}
          </select>
          <select
            name="actorType"
            defaultValue={query.actorType ?? ""}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
          >
            <option value="">All actors</option>
            {AUDIT_ACTOR_FILTERS.map((actorType) => (
              <option key={actorType} value={actorType}>
                {actorType}
              </option>
            ))}
          </select>
          <input
            name="action"
            defaultValue={query.action ?? ""}
            placeholder="Action contains..."
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
          />
          <div className="flex gap-3">
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="pageSize" value={String(query.pageSize)} />
            <button className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
              Filter
            </button>
            <Link
              href="/admin/audit"
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      {!result.logs.length ? (
        <DataState
          eyebrow={hasActiveFilters ? "No Matches" : "Audit Empty"}
          title={hasActiveFilters ? "No audit logs matched these filters" : "No audit events recorded yet"}
          description={
            hasActiveFilters
              ? "Adjust or clear the current filters to inspect a broader audit history."
              : "Audit logging is wired, but there are no recorded events in the database yet."
          }
          actions={
            hasActiveFilters
              ? [{ href: "/admin/audit", label: "Clear filters", variant: "secondary" }]
              : undefined
          }
        />
      ) : (
        <section className="space-y-4">
          {result.logs.map((log) => (
            <article
              key={log.id}
              className="rounded-[1.5rem] border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{log.action}</h2>
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
                      {log.entityType}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        log.actorType === "ADMIN"
                          ? "bg-emerald-100 text-emerald-800"
                          : log.actorType === "CUSTOMER"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {log.actorType}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-1 text-sm text-muted">
                    <p>Actor: {log.actorLabel}</p>
                    <p>
                      Entity: <span className="font-mono text-xs">{log.entityId}</span>
                    </p>
                    <p>Recorded: {formatDateTime(log.createdAt)}</p>
                    {log.requestId ? <p>Request ID: {log.requestId}</p> : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted">
                  <p className="font-medium text-foreground">Quick Diff</p>
                  <p className="mt-2">{log.beforeSummary ?? "No before snapshot"}</p>
                  <p className="mt-2">{log.afterSummary ?? "No after snapshot"}</p>
                </div>
              </div>

              {(log.beforeJsonString || log.afterJsonString || log.metadataString) ? (
                <div className="mt-5 grid gap-4 xl:grid-cols-3">
                  {log.beforeJsonString ? (
                    <details className="rounded-2xl border border-border bg-background p-4">
                      <summary className="cursor-pointer text-sm font-medium">Before Snapshot</summary>
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-muted">
                        {log.beforeJsonString}
                      </pre>
                    </details>
                  ) : null}

                  {log.afterJsonString ? (
                    <details className="rounded-2xl border border-border bg-background p-4">
                      <summary className="cursor-pointer text-sm font-medium">After Snapshot</summary>
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-muted">
                        {log.afterJsonString}
                      </pre>
                    </details>
                  ) : null}

                  {log.metadataString ? (
                    <details className="rounded-2xl border border-border bg-background p-4">
                      <summary className="cursor-pointer text-sm font-medium">Metadata</summary>
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-muted">
                        {log.metadataString}
                      </pre>
                    </details>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={buildAuditHref(currentSearchParams, {
              page: query.page > 1 ? String(query.page - 1) : "1",
            })}
            className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
              query.page === 1
                ? "pointer-events-none border-border text-muted/50"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            Previous
          </Link>
          <span className="text-sm text-muted">
            Page {query.page} of {totalPages}
          </span>
          <Link
            href={buildAuditHref(currentSearchParams, {
              page: query.page < totalPages ? String(query.page + 1) : String(totalPages),
            })}
            className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
              query.page >= totalPages
                ? "pointer-events-none border-border text-muted/50"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            Next
          </Link>
        </div>
      ) : null}
    </div>
  );
}
