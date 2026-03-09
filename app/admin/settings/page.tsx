import Link from "next/link";

import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { DataState } from "@/components/ui/data-state";
import { toUserFacingErrorMessage } from "@/lib/user-facing-error";
import { listAdminStoreConfigs } from "@/server/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let snapshot: Awaited<ReturnType<typeof listAdminStoreConfigs>> | null = null;
  let errorMessage: string | null = null;

  try {
    snapshot = await listAdminStoreConfigs();
  } catch (error) {
    errorMessage = toUserFacingErrorMessage(
      error,
      "Store settings could not be loaded right now. Try again after the database setup is ready.",
    );
  }

  if (!snapshot) {
    return (
      <DataState
        tone="error"
        eyebrow="Settings Error"
        title="Admin settings are not available"
        description={
          errorMessage ??
          "Store settings could not be loaded right now. Try again after the database setup is ready."
        }
        actions={[
          { href: "/admin/settings", label: "Reload settings" },
          { href: "/admin", label: "Back to admin", variant: "secondary" },
        ]}
      />
    );
  }

  const runtimeConnectedCount = snapshot.configs.filter((config) => config.usedBy.length).length;
  const booleanSettingCount = snapshot.configs.filter((config) => config.input === "boolean").length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Managed Keys</p>
          <div className="mt-3 text-3xl font-semibold">{snapshot.totalConfigs}</div>
          <p className="mt-2 text-sm text-muted">
            Semua key di halaman ini dipertahankan sebagai config resmi untuk engine baru.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Missing Defaults</p>
          <div className="mt-3 text-3xl font-semibold">{snapshot.missingCount}</div>
          <p className="mt-2 text-sm text-muted">
            Missing key sekarang bisa di-restore dari default registry tanpa sentuh database manual.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-surface p-5">
          <p className="text-sm text-muted">Runtime Connected</p>
          <div className="mt-3 text-3xl font-semibold">{runtimeConnectedCount}</div>
          <p className="mt-2 text-sm text-muted">
            {booleanSettingCount} key(s) saat ini berupa toggle boolean untuk policy runtime.
          </p>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Store Settings</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
              Settings ini menjadi control panel untuk policy yang memang sudah dipakai live oleh
              checkout, promotions, shipping, dan payment instructions. Update dilakukan bulk
              melalui admin API dan setiap perubahan dicatat ke audit log.
            </p>
          </div>
          <Link
            href="/api/admin/settings"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
          >
            Inspect API
          </Link>
        </div>
      </section>

      <StoreSettingsForm
        sections={snapshot.sections}
        missingCount={snapshot.missingCount}
      />
    </div>
  );
}
