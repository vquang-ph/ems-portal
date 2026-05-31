import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/common/EmptyState";
import { Tag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_app/admin/skills")({
  component: AdminSkillsPage,
});

function AdminSkillsPage() {
  return (
    <EmptyState
      icon={Tag}
      title="Skills taxonomy"
      description="Manage the engineering skills categories and taxonomy. This feature is coming soon."
    />
  );
}
