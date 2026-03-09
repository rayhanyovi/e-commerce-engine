import Link from "next/link";

import { DataState } from "@/components/ui/data-state";
import { formatDateTime } from "@/lib/formatters";
import { toFlatSearchParams, type SearchParamInput } from "@/lib/search-params";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";
import { getAdminUserCounts, listAdminUsers } from "@/server/users";
import { UserListQuerySchema } from "@/shared/contracts";

export const dynamic = "force-dynamic";

function buildUsersHref(
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

  return query ? `/admin/users?${query}` : "/admin/users";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamInput>;
}) {
  const currentSearchParams = toFlatSearchParams(await searchParams);
  const query = UserListQuerySchema.parse(currentSearchParams);
  let counts: Awaited<ReturnType<typeof getAdminUserCounts>> | null = null;
  let result: Awaited<ReturnType<typeof listAdminUsers>> | null = null;
  let errorMessage: string | null = null;

  try {
    [counts, result] = await Promise.all([
      getAdminUserCounts(),
      listAdminUsers(query),
    ]);
  } catch (error) {
    errorMessage = toUserFacingErrorMessage(
      error,
      "Admin users data could not be loaded right now. Try again after the database setup is ready.",
    );
  }

  if (!counts || !result) {
    return (
      <DataState
        tone="error"
        eyebrow="Users Error"
        title="Admin users page is not available"
        description={
          errorMessage ??
          "Admin users data could not be loaded right now. Try again after the database setup is ready."
        }
        actions={[
          { href: "/admin/users", label: "Reload users" },
          { href: "/admin", label: "Back to admin", variant: "secondary" },
        ]}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(result.total / query.pageSize));
  const hasActiveFilters = Boolean(query.search || query.role);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Total Users</p>
          <div className="mt-3 text-3xl font-semibold">{counts.totalUsers}</div>
          <p className="mt-2 text-sm text-muted">
            Customer dan admin accounts yang ada di engine saat ini.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Customers</p>
          <div className="mt-3 text-3xl font-semibold">{counts.totalCustomers}</div>
          <p className="mt-2 text-sm text-muted">
            Accounts customer yang dipakai untuk cart, checkout, dan orders.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Admins</p>
          <div className="mt-3 text-3xl font-semibold">{counts.totalAdmins}</div>
          <p className="mt-2 text-sm text-muted">
            Internal operators yang punya akses admin workspace.
          </p>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">User Registry</h2>
            <p className="mt-2 text-sm text-muted">
              Search dan filter user sekarang membaca data langsung dari server module baru.
            </p>
          </div>
          <Link
            href="/api/admin/users"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
          >
            Inspect API
          </Link>
        </div>

        <form className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr_auto]">
          <input
            name="search"
            defaultValue={query.search ?? ""}
            placeholder="Search name, email, phone..."
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
          />
          <select
            name="role"
            defaultValue={query.role ?? ""}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
          >
            <option value="">All roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <div className="flex gap-3">
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="pageSize" value={String(query.pageSize)} />
            <button className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
              Filter
            </button>
            <Link
              href="/admin/users"
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Reset
            </Link>
          </div>
        </form>

        {result.users.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 pr-4 font-medium">User</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium">Orders</th>
                  <th className="pb-3 pr-4 font-medium">Addresses</th>
                  <th className="pb-3 pr-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {result.users.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted">{user.email}</div>
                      <div className="mt-1 text-xs text-muted">{user.phone || "-"}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{user._count.orders}</td>
                    <td className="py-3 pr-4">{user._count.addresses}</td>
                    <td className="py-3 pr-4">{formatDateTime(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5">
            <DataState
              eyebrow={hasActiveFilters ? "No Matches" : "Users Empty"}
              title={hasActiveFilters ? "No users matched this query" : "No users have been created yet"}
              description={
                hasActiveFilters
                  ? "Adjust or clear the current filters to inspect a broader user set."
                  : "Admin user registry is connected, but there are still no accounts stored in the database."
              }
              size="compact"
              actions={
                hasActiveFilters
                  ? [{ href: "/admin/users", label: "Clear filters", variant: "secondary" }]
                  : undefined
              }
            />
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={buildUsersHref(currentSearchParams, {
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
              href={buildUsersHref(currentSearchParams, {
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
      </section>
    </div>
  );
}
