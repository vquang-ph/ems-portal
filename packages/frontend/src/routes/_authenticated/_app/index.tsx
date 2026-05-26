import { createFileRoute } from "@tanstack/react-router";
import { AppHomePage } from "@/modules/auth";

export const Route = createFileRoute("/_authenticated/_app/")({
  component: AppHomePage,
});
