import { LoadingState } from "@/components/ui/loading-state";

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <LoadingState
        eyebrow="Admin Loading"
        title="Loading admin workspace"
        description="Dashboard summaries, operational queues, and admin tools are being prepared."
        cardCount={4}
        showSidebar
      />
    </div>
  );
}
