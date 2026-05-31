import { z } from "zod";
import { BaseSchema } from "../base.schema";

export const USER_ROLE_VALUES = [
  "client",
  "service_provider",
  "admin",
] as const;

export type UserRole = (typeof USER_ROLE_VALUES)[number];

export const UserRole = {
  Client: "client",
  ServiceProvider: "service_provider",
  Admin: "admin",
} as const satisfies Record<string, UserRole>;

// Roles a brand-new user is allowed to self-assign at /register.
// Admins are seed-only (or admin-promoted later).
export const PUBLIC_USER_ROLE_VALUES = [
  UserRole.Client,
  UserRole.ServiceProvider,
] as const;

export type PublicUserRole = (typeof PUBLIC_USER_ROLE_VALUES)[number];

export const USER_STATUS_VALUES = ["active", "suspended", "deleted"] as const;

export type UserStatus = (typeof USER_STATUS_VALUES)[number];

export const UserSchema = BaseSchema.extend({
  email: z.string().email().max(254),
  name: z.string().min(1).max(120),
  role: z.enum(USER_ROLE_VALUES),
  status: z.enum(USER_STATUS_VALUES).optional(),
  emailVerifiedAt: z.coerce.date().nullable().optional(),
  lastLoginAt: z.coerce.date().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;

// --------------------------------------------------------------------------
// API Related Schemas
// --------------------------------------------------------------------------

export const PasswordSchema = z.string().min(8).max(128);

export const LoginSchema = z.object({
  email: UserSchema.shape.email,
  password: PasswordSchema,
});

export type Login = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: UserSchema.shape.email,
  name: UserSchema.shape.name,
  role: z.enum(PUBLIC_USER_ROLE_VALUES),
  password: PasswordSchema,
});

export type Register = z.infer<typeof RegisterSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Returned by POST /auth/refresh. Shape mirrors AuthResponse so frontend
// code can treat login and refresh identically. The refresh token itself
// rides in an httpOnly cookie and never appears in JS-readable payloads.
export const RefreshResponseSchema = AuthResponseSchema;

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
