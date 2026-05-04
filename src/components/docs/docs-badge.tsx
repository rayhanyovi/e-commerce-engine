type BadgeVariant =
  | "get"
  | "post"
  | "patch"
  | "delete"
  | "public"
  | "customer"
  | "admin"
  | "default";

const variantStyles: Record<BadgeVariant, string> = {
  get: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  post: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  patch: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  delete: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
  public: "border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300",
  customer: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
  admin: "border-zinc-300 bg-zinc-900 text-white dark:border-zinc-600 dark:bg-zinc-800",
  default: "border-border bg-secondary text-foreground",
};

export function DocsBadge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${variantStyles[variant]}`}
    >
      {label}
    </span>
  );
}
