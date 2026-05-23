import type { Todo } from "@ems-portal/types";
import { TodoStatus } from "@ems-portal/types";

export const mockedTodos: Todo[] = [
  {
    id: "todo-1",
    title: "Buy groceries",
    description: "Milk, eggs, bread, and vegetables",
    status: TodoStatus.Todo,
    createdAt: new Date("2024-12-01T09:00:00Z"),
    updatedAt: new Date("2024-12-01T09:00:00Z"),
  },
  {
    id: "todo-2",
    title: "Write unit tests",
    description: "Add unit tests for TodoOverview and TodoList",
    status: TodoStatus.InProgress,
    createdAt: new Date("2024-12-02T10:30:00Z"),
    updatedAt: new Date("2024-12-03T14:15:00Z"),
  },
  {
    id: "todo-3",
    title: "Review pull request",
    description: "Review PR #42 and leave comments",
    status: TodoStatus.Pending,
    createdAt: new Date("2024-12-04T08:00:00Z"),
    updatedAt: new Date("2024-12-04T08:00:00Z"),
  },
];

export const mockedSingleTodo: Todo = mockedTodos[0];

export const mockedTodoId = mockedSingleTodo.id;
