import { TodoStatus } from "@ems-portal/types";

export const INITIAL_TODOS = [
  {
    title: "Setup Monorepo Structure",
    description: "Configure workspaces for backend and frontend",
    status: TodoStatus.Completed,
  },
  {
    title: "Configure TypeORM Migrations",
    description: "Ensure database schema is version controlled",
    status: TodoStatus.Completed,
  },
  {
    title: "Write Integration Tests",
    description: "Ensure API endpoints return correct status codes",
    status: TodoStatus.Pending,
  },
  {
    title: "Build Frontend UI",
    description: "Connect React app to NestJS API",
    status: TodoStatus.Pending,
  },
];
