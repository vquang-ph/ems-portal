import { createFileRoute, redirect } from "@tanstack/react-router";
import { jotaiStore } from "@/lib/jotaiStore";
import { currentUserAtom } from "@/modules/auth/store/sessionAtom";
import { EmptyState } from "@/components/common/EmptyState";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_app/bookings")({
  beforeLoad: () => {
    const user = jotaiStore.get(currentUserAtom);
    if (!user || !["client", "service_provider"].includes(user.role)) {
      return redirect({ to: "/" });
    }
  },
  component: BookingsPage,
});

function BookingsPage() {
  return (
    <EmptyState
      icon={Calendar}
      title="Bookings"
      description="Manage your engineering engagements and bookings. This feature is coming soon."
    />
  );
}
