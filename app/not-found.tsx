import { DataState } from "@/components/ui/data-state";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-6 py-10 lg:px-10">
      <DataState
        eyebrow="Not Found"
        title="This page does not exist"
        description="The route may not be implemented yet in this migration, or the requested record could not be found."
        actions={[
          { href: "/", label: "Back to storefront" },
          { href: "/admin", label: "Go to admin", variant: "secondary" },
        ]}
      />
    </main>
  );
}
