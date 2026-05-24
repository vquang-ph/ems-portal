import { TodoOverview } from "@/modules/todo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/todo")({
  component: TodoOverview,
});
