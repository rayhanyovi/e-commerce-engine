import { LoadingState } from "@/components/ui/loading-state";

export default function AuthLoading() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-4xl items-center px-6 py-10 lg:px-10">
      <LoadingState
        eyebrow="Auth Loading"
        title="Loading authentication flow"
        description="Session form state and redirect context are being prepared."
        cardCount={2}
      />
    </main>
  );
}
