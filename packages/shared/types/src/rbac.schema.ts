import { z } from "zod";
import { type UserRole } from "./auth/auth.schema";

/**
 * Canonical permission strings in `verb:resource:scope` form.
 *
 * Scopes:
 *   - `own` — actor is the owner of the resource
 *   - `any` — applies regardless of ownership (typically admin/read-broad)
 *
 * Adding a permission here is a contract change; update the role map below.
 */
export const PERMISSION_VALUES = [
  // Provider profile
  "provider_profile:read:any",
  "provider_profile:create:own",
  "provider_profile:update:own",

  // Service request
  "service_request:create:own",
  "service_request:read:own",
  "service_request:update:own",
  "service_request:cancel:own",

  // Engagement
  "engagement:read:own",
  "engagement:update:own",

  // Rating
  "rating:create:own",

  // Admin user management
  "user:read:any",
  "user:suspend:any",
  "user:delete:any",
] as const;

export const PermissionSchema = z.enum(PERMISSION_VALUES);
export type Permission = z.infer<typeof PermissionSchema>;

/**
 * Role → permission map. Admin is intentionally omitted; the guard grants
 * admin implicit access at runtime. This keeps the admin grant in exactly
 * one place (guard + helper) instead of duplicating the full permission list.
 */
export const ROLE_PERMISSIONS: Record<
  Exclude<UserRole, "admin">,
  Permission[]
> = {
  client: [
    "provider_profile:read:any",
    "service_request:create:own",
    "service_request:read:own",
    "service_request:update:own",
    "service_request:cancel:own",
    "engagement:read:own",
    "rating:create:own",
  ],
  service_provider: [
    "provider_profile:create:own",
    "provider_profile:update:own",
    "engagement:read:own",
    "engagement:update:own",
  ],
};

/**
 * Returns true if the given role is permitted to perform the action.
 * Admin is always permitted.
 *
 * @param role - The user's role.
 * @param permission - The permission to check.
 * @returns `true` when the role holds the permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  if (role === "admin") return true;
  return ROLE_PERMISSIONS[role].includes(permission);
}
