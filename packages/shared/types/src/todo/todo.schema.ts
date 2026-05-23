import { z } from "zod";
import { BaseSchema } from "../base.schema";

export const TODO_STATUS_VALUES = [
  "todo",
  "pending",
  "in-progress",
  "completed",
] as const;

export type TodoStatus = (typeof TODO_STATUS_VALUES)[number];

export const TodoStatus = {
  Todo: "todo",
  Pending: "pending",
  InProgress: "in-progress",
  Completed: "completed",
} as const satisfies Record<string, TodoStatus>;

export const TodoSchema = BaseSchema.extend({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  status: z.enum(TODO_STATUS_VALUES),
});

export type Todo = z.infer<typeof TodoSchema>;

// --------------------------------------------------------------------------
// API Related Schemas
// --------------------------------------------------------------------------

export const TodoParamsSchema = BaseSchema.pick({
  id: true,
});

export type TodoParams = z.infer<typeof TodoParamsSchema>;

export const TodoCreateSchema = TodoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: TodoSchema.shape.status.optional(),
});

export type TodoCreate = z.infer<typeof TodoCreateSchema>;

export const TodoUpdateSchema = TodoCreateSchema.partial();

export type TodoUpdate = z.infer<typeof TodoUpdateSchema>;
