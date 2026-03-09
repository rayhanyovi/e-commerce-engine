"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { formatDateTime } from "@/lib/formatters";
import {
  initializeStoreSettingsRequest,
  updateStoreSettingsRequest,
} from "@/lib/settings/client";
import type { StoreConfigKey } from "@/shared/contracts";

type StoreConfigInput = "text" | "number" | "boolean" | "textarea";

interface StoreSettingsFormConfig {
  key: StoreConfigKey;
  label: string;
  description: string;
  input: StoreConfigInput;
  value: string;
  defaultValue: string;
  isMissing: boolean;
  usedBy: string[];
  updatedAt: string | null;
}

interface StoreSettingsFormSection {
  id: string;
  title: string;
  description: string;
  configs: StoreSettingsFormConfig[];
}

function buildValueState(sections: StoreSettingsFormSection[]) {
  return Object.fromEntries(
    sections
      .flatMap((section) => section.configs)
      .map((config) => [config.key, config.value]),
  ) as Record<StoreConfigKey, string>;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to update store settings";
}

export function StoreSettingsForm({
  sections,
  missingCount,
}: {
  sections: StoreSettingsFormSection[];
  missingCount: number;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<StoreConfigKey, string>>(
    () => buildValueState(sections),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const configs = sections.flatMap((section) => section.configs);
  const dirtyConfigs = configs.filter((config) => values[config.key] !== config.value);

  useEffect(() => {
    setValues(buildValueState(sections));
  }, [sections]);

  function setConfigValue(key: StoreConfigKey, value: string) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!dirtyConfigs.length) {
        setSuccess("No settings changed");
        return;
      }

      const result = await updateStoreSettingsRequest({
        configs: dirtyConfigs.map((config) => ({
          key: config.key,
          label: config.label,
          value: values[config.key],
        })),
      });

      setSuccess(
        result.updatedCount
          ? `Saved ${result.updatedCount} setting(s)`
          : "No settings changed",
      );
      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleInitializeMissing() {
    setIsInitializing(true);
    setError(null);
    setSuccess(null);

    try {
      if (missingCount === 0) {
        setSuccess("All default settings are already initialized");
        return;
      }

      const result = await initializeStoreSettingsRequest();

      setSuccess(
        result.createdCount
          ? `Initialized ${result.createdCount} missing default setting(s)`
          : "All default settings are already initialized",
      );
      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsInitializing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-[1.5rem] border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Settings Registry</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              Settings di bawah ini sudah terhubung ke checkout, shipping, payment instructions,
              dan policy toggles. Update akan tersimpan via admin API dan ikut dicatat ke audit
              log.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted">
            {dirtyConfigs.length} unsaved change(s)
          </div>
        </div>

        {missingCount > 0 ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            {missingCount} setting(s) are still missing from the database and are currently falling
            back to their default values.
          </div>
        ) : null}

        {error ? (
          <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-accent/60"
          >
            {isSubmitting ? "Saving..." : "Save Settings"}
          </button>
          <button
            type="button"
            onClick={() => setValues(buildValueState(sections))}
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Reset Unsaved
          </button>
          <button
            type="button"
            onClick={() => void handleInitializeMissing()}
            disabled={isInitializing}
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isInitializing ? "Restoring..." : "Restore Missing Defaults"}
          </button>
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.id} className="rounded-[1.5rem] border border-border bg-surface p-5">
          <div>
            <h3 className="text-lg font-semibold">{section.title}</h3>
            <p className="mt-2 text-sm leading-7 text-muted">{section.description}</p>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {section.configs.map((config) => (
              <div
                key={config.key}
                data-testid={`setting-card-${config.key}`}
                className="rounded-[1.5rem] border border-border bg-background p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">{config.label}</h4>
                    <p className="mt-2 text-sm leading-6 text-muted">{config.description}</p>
                  </div>
                  {config.isMissing ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                      Missing
                    </span>
                  ) : null}
                </div>

                <div className="mt-4">
                  {config.input === "boolean" ? (
                    <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-4 text-sm font-medium">
                      <input
                        data-testid={`setting-input-${config.key}`}
                        type="checkbox"
                        checked={values[config.key] === "true"}
                        onChange={(event) =>
                          setConfigValue(config.key, event.target.checked ? "true" : "false")
                        }
                      />
                      {values[config.key] === "true" ? "Enabled" : "Disabled"}
                    </label>
                  ) : config.input === "textarea" ? (
                    <textarea
                      data-testid={`setting-input-${config.key}`}
                      value={values[config.key]}
                      onChange={(event) => setConfigValue(config.key, event.target.value)}
                      rows={5}
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
                    />
                  ) : (
                    <input
                      data-testid={`setting-input-${config.key}`}
                      type={config.input === "number" ? "number" : "text"}
                      min={config.input === "number" ? "0" : undefined}
                      value={values[config.key]}
                      onChange={(event) =>
                        setConfigValue(
                          config.key,
                          config.input === "number"
                            ? event.target.value.replace(/[^\d]/g, "")
                            : event.target.value,
                        )
                      }
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-accent"
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {config.usedBy.map((usage) => (
                    <span
                      key={`${config.key}:${usage}`}
                      className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800"
                    >
                      {usage}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-1 text-xs text-muted">
                  <p>Key: {config.key}</p>
                  <p>Default: {config.defaultValue}</p>
                  <p>
                    Last saved: {config.updatedAt ? formatDateTime(config.updatedAt) : "not saved yet"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </form>
  );
}
