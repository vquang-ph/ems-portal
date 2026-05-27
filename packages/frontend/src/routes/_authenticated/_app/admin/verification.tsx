import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/common/EmptyState";
import { BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_app/admin/verification")(
  {
    component: AdminVerificationPage,
  },
);

function AdminVerificationPage() {
  return (
    <EmptyState
      icon={BadgeCheck}
      title="Verification"
      description="Review and manage provider verification submissions. This feature is coming soon."
    />
  );
}
