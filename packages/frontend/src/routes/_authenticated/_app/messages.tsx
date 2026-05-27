import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/common/EmptyState";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_app/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Messages"
      description="Chat and communicate with clients and service providers. This feature is coming soon."
    />
  );
}
