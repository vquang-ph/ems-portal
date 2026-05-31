import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/app/layout/AppShell";

export const Route = createFileRoute("/_authenticated/_app")({
  component: AppShell,
});
