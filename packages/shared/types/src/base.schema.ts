import { z } from "zod";

export const StringIdSchema = z.object({
  id: z.string(),
});

export type StringId = z.infer<typeof StringIdSchema>;

export const BaseSchema = z.object({
  id: StringIdSchema.shape.id,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});

export type Base = z.infer<typeof BaseSchema>;

export const AffectedResponseSchema = z.object({
  affected: z.number().int().default(0),
});

export type AffectedResponse = z.infer<typeof AffectedResponseSchema>;

export const ErrorResponseSchema = z.object({
  status: z.number().int(),
  error: z.string(),
  timestamp: z.coerce.date(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
