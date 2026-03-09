import Link from "next/link";

import {
  apiDomains,
  architectureLayers,
  clientHelpers,
  codeExamples,
  contractGroups,
  developerDocsNav,
  developerDocsStats,
  domainHelpers,
  environmentVariables,
  envelopeExample,
  hooks,
  operationsNotes,
  quickstartCommand,
  quickstartSteps,
  serverModules,
  type AccessLevel,
  type HttpMethod,
} from "@/content/developer-docs";

function MethodBadge({ method }: { method: HttpMethod }) {
  const styles: Record<HttpMethod, string> = {
    GET: "border-sky-200 bg-sky-50 text-sky-700",
    POST: "border-emerald-200 bg-emerald-50 text-emerald-700",
    PATCH: "border-amber-200 bg-amber-50 text-amber-800",
    DELETE: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[method]}`}>
      {method}
    </span>
  );
}

function AccessBadge({ access }: { access: AccessLevel }) {
  const styles: Record<AccessLevel, string> = {
    Public: "border-stone-200 bg-stone-50 text-stone-700",
    Customer: "border-orange-200 bg-orange-50 text-orange-700",
    Admin: "border-zinc-300 bg-zinc-900 text-white",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[access]}`}>
      {access}
    </span>
  );
}

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-stone-800 bg-stone-950">
      <div className="border-b border-stone-800 px-4 py-3 text-xs uppercase tracking-[0.24em] text-stone-400">
        {language}
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-sm leading-7 text-stone-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-muted">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-3 text-base leading-8 text-muted">{description}</p>
    </div>
  );
}

export function DeveloperDocsPage() {
  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section
          id="overview"
          className="overflow-hidden rounded-[2.25rem] border border-border bg-surface shadow-[0_32px_100px_rgb(28_25_23_/_0.08)]"
        >
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-muted">
                Developer Portal
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Next.js ecommerce engine reference for API, server modules, hooks, and integration
                flow
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
                This page documents the reusable engine surface that should stay stable across new
                storefront projects. Treat it as the public reference for how to consume the engine
                rather than rewriting auth, cart, checkout, orders, payments, or admin operations
                from scratch.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-strong"
                >
                  Open Storefront
                </Link>
                <Link
                  href="/admin"
                  className="rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
                >
                  Open Admin
                </Link>
                <a
                  href="#api-reference"
                  className="rounded-full border border-border bg-background/80 px-5 py-3 text-sm font-medium text-muted transition hover:text-foreground"
                >
                  Jump to API
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-background/75 p-5">
              <p className="text-sm font-medium text-foreground">Engine posture</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                <p>Build the commerce engine once, then reuse it for many storefronts.</p>
                <p>
                  UI, branding, copy, and merchandising change per client. Contracts, business
                  rules, and operational flows should not.
                </p>
                <p>
                  Same-origin API, Prisma-backed data, cookie-based auth, and shared Zod contracts
                  are the baseline guarantees.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-px border-t border-border bg-border lg:grid-cols-4">
            {developerDocsStats.map((stat) => (
              <div key={stat.label} className="bg-background/75 px-6 py-5">
                <p className="text-sm text-muted">{stat.label}</p>
                <div className="mt-2 text-3xl font-semibold text-foreground">{stat.value}</div>
                <p className="mt-2 text-sm leading-7 text-muted">{stat.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="xl:sticky xl:top-4 xl:self-start">
            <div className="rounded-[2rem] border border-border bg-surface px-5 py-5 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-muted">
                On This Page
              </p>
              <nav className="mt-4 space-y-2">
                {developerDocsNav.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted transition hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="space-y-6">
            <section
              id="quickstart"
              className="scroll-mt-24 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]"
            >
              <SectionHeading
                eyebrow="Start Here"
                title="Quickstart"
                description="Use this flow whenever you spin up a new local environment or hand the engine to another developer."
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {quickstartSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-[1.5rem] border border-border bg-background/75 p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{step.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <CodeBlock code={quickstartCommand} language="bash" />
              </div>
            </section>

            <section
              id="environment"
              className="scroll-mt-24 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]"
            >
              <SectionHeading
                eyebrow="Configuration"
                title="Environment Contract"
                description="These variables are the minimum contract expected by Prisma, auth, runtime settings, and local bootstrap scripts."
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {environmentVariables.map((entry) => (
                  <article
                    key={entry.name}
                    className="rounded-[1.5rem] border border-border bg-background/75 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-sm font-semibold text-foreground">{entry.name}</code>
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                        .env
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted">{entry.notes}</p>
                    <div className="mt-4 rounded-2xl border border-border bg-white px-4 py-3 text-xs text-muted">
                      Default: <code>{entry.defaultValue}</code>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="architecture"
              className="scroll-mt-24 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]"
            >
              <SectionHeading
                eyebrow="System Shape"
                title="Architecture Layers"
                description="When adding new functionality, keep business rules in the server layer and treat UI, hooks, and client helpers as adapters."
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {architectureLayers.map((layer) => (
                  <article
                    key={layer.title}
                    className="rounded-[1.5rem] border border-border bg-background/75 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{layer.title}</h3>
                      <code className="text-xs text-muted">{layer.path}</code>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted">{layer.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="api-reference"
              className="scroll-mt-24 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]"
            >
              <SectionHeading
                eyebrow="Transport Layer"
                title="API Reference"
                description="Every route handler returns the shared API envelope. Customer-owned resources are scoped on the server and mutating routes assume same-origin requests."
              />
              <div className="mt-6 space-y-6">
                {apiDomains.map((domain) => (
                  <section key={domain.id} className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">{domain.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted">{domain.description}</p>
                    </div>
                    <div className="space-y-4">
                      {domain.endpoints.map((endpoint) => (
                        <article
                          key={endpoint.path}
                          className="rounded-[1.5rem] border border-border bg-background/75 p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <code className="text-sm font-semibold text-foreground">
                                {endpoint.path}
                              </code>
                              <p className="mt-2 text-sm leading-7 text-muted">
                                {endpoint.summary}
                              </p>
                            </div>
                            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                              {endpoint.source}
                            </span>
                          </div>

                          <div className="mt-5 space-y-4">
                            {endpoint.methods.map((operation) => (
                              <div
                                key={`${endpoint.path}-${operation.method}`}
                                className="rounded-[1.25rem] border border-border bg-white px-4 py-4"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <MethodBadge method={operation.method} />
                                  <AccessBadge access={operation.access} />
                                </div>
                                <div className="mt-4 grid gap-4 text-sm leading-7 text-muted lg:grid-cols-3">
                                  <div>
                                    <p className="font-medium text-foreground">Request</p>
                                    <p className="mt-1">{operation.request}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">Response</p>
                                    <p className="mt-1">{operation.response}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">Notes</p>
                                    <p className="mt-1">{operation.notes}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>

            <section
              id="server-modules"
              className="scroll-mt-24 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]"
            >
              <SectionHeading
                eyebrow="Business Core"
                title="Server Modules"
                description="These modules are the real engine. New storefronts should reuse them instead of implementing business rules again in UI, hooks, or route-specific code."
              />
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {serverModules.map((module) => (
                  <article
                    key={module.title}
                    className="rounded-[1.5rem] border border-border bg-background/75 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold text-foreground">{module.title}</h3>
                      <code className="text-xs text-muted">{module.path}</code>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted">{module.summary}</p>
                    <div className="mt-5 space-y-3">
                      {module.functions.map((fn) => (
                        <div
                          key={`${module.title}-${fn.name}`}
                          className="rounded-2xl border border-border bg-white px-4 py-4"
                        >
                          <p className="font-medium text-foreground">{fn.name}</p>
                          <code className="mt-2 block text-xs text-muted">{fn.signature}</code>
                          <p className="mt-2 text-sm leading-7 text-muted">{fn.notes}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="domain-helpers"
              className="scroll-mt-24 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]"
            >
              <SectionHeading
                eyebrow="Reusable Logic"
                title="Domain Helpers"
                description="These pure or low-level helpers are safe to reuse across server modules. They represent stable domain rules that should not drift per client."
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {domainHelpers.map((helper) => (
                  <article
                    key={helper.name}
                    className="rounded-[1.5rem] border border-border bg-background/75 p-5"
                  >
                    <h3 className="text-lg font-semibold text-foreground">{helper.name}</h3>
                    <code className="mt-3 block text-xs text-muted">{helper.signature}</code>
                    <p className="mt-3 text-sm leading-7 text-muted">{helper.notes}</p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="hooks"
              className="scroll-mt-24 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]"
            >
              <SectionHeading
                eyebrow="Client State"
                title="Hooks"
                description="Only two hooks remain on purpose. The engine is server-driven by default, so hooks are reserved for local UI and mutation workflows."
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {hooks.map((hook) => (
                  <article
                    key={hook.name}
                    className="rounded-[1.5rem] border border-border bg-background/75 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold text-foreground">{hook.name}</h3>
                      <code className="text-xs text-muted">{hook.path}</code>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted">{hook.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {hook.returns.map((entry) => (
                        <span
                          key={`${hook.name}-${entry}`}
                          className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted"
                        >
                          {entry}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="client-helpers"
              className="scroll-mt-24 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]"
            >
              <SectionHeading
                eyebrow="UI Adapters"
                title="Client Helpers"
                description="These helpers are thin wrappers around same-origin route handlers. They should stay simple and never become a second business logic layer."
              />
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {clientHelpers.map((helper) => (
                  <article
                    key={helper.title}
                    className="rounded-[1.5rem] border border-border bg-background/75 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{helper.title}</h3>
                      <code className="text-xs text-muted">{helper.path}</code>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted">{helper.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {helper.functions.map((fn) => (
                        <span
                          key={`${helper.title}-${fn}`}
                          className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted"
                        >
                          {fn}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="contracts"
              className="scroll-mt-24 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]"
            >
              <SectionHeading
                eyebrow="Source of Truth"
                title="Contracts"
                description="Shared contracts define the request and response shapes. If you change a route, module, or client helper, update the shared contract first."
              />
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {contractGroups.map((group) => (
                  <article
                    key={group.title}
                    className="rounded-[1.5rem] border border-border bg-background/75 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
                      <code className="text-xs text-muted">{group.path}</code>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted">{group.summary}</p>
                    <ul className="mt-4 space-y-2 text-sm text-muted">
                      {group.items.map((item) => (
                        <li key={`${group.title}-${item}`} className="rounded-2xl border border-border bg-white px-4 py-3">
                          <code>{item}</code>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <div className="mt-6">
                <CodeBlock code={envelopeExample} language="json" />
              </div>
            </section>

            <section
              id="examples"
              className="scroll-mt-24 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]"
            >
              <SectionHeading
                eyebrow="Examples"
                title="Common Integration Patterns"
                description="These examples show the intended way to consume the engine from server-driven pages and client interaction layers."
              />
              <div className="mt-6 space-y-5">
                {codeExamples.map((example) => (
                  <article
                    key={example.title}
                    className="rounded-[1.5rem] border border-border bg-background/75 p-5"
                  >
                    <h3 className="text-xl font-semibold text-foreground">{example.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{example.description}</p>
                    <div className="mt-4">
                      <CodeBlock code={example.code} language={example.language} />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="operations"
              className="scroll-mt-24 rounded-[2rem] border border-border bg-surface px-6 py-6 shadow-[0_24px_80px_rgb(28_25_23_/_0.05)]"
            >
              <SectionHeading
                eyebrow="Operational Notes"
                title="Security, Verification, and Delivery"
                description="Use these guardrails whenever you deploy, audit, or hand this engine to another team."
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {operationsNotes.map((note, index) => (
                  <article
                    key={`note-${index + 1}`}
                    className="rounded-[1.5rem] border border-border bg-background/75 p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                      Rule {index + 1}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-muted">{note}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
