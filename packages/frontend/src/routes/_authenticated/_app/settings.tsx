import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/common/EmptyState";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <EmptyState
      icon={SettingsIcon}
      title="Settings"
      description="Manage your account preferences and settings. This feature is coming soon."
    />
  );
}
