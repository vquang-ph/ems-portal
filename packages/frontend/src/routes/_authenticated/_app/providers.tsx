import { createFileRoute, redirect } from "@tanstack/react-router";
import { jotaiStore } from "@/lib/jotaiStore";
import { currentUserAtom } from "@/modules/auth/store/sessionAtom";
import { EmptyState } from "@/components/common/EmptyState";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_app/providers")({
  beforeLoad: async () => {
    const user = jotaiStore.get(currentUserAtom);
    if (user?.role !== "client") {
      throw redirect({ to: "/" });
    }
  },
  component: ProvidersPage,
});

function ProvidersPage() {
  return (
    <EmptyState
      icon={Search}
      title="Find providers"
      description="Browse and search for engineering experts matching your needs. This feature is coming soon."
    />
  );
}
