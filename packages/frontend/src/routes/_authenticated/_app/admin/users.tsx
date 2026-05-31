import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/common/EmptyState";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_app/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return (
    <EmptyState
      icon={Users}
      title="Users"
      description="Manage platform users and their accounts. This feature is coming soon."
    />
  );
}
