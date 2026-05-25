import { ForbiddenException } from "@nestjs/common";
import type { UserRole } from "@ems-portal/types";

interface Actor {
  id: string;
  role: UserRole;
}

/**
 * Throws ForbiddenException unless the actor owns the resource or is admin.
 *
 * @param resource - The loaded resource. Must carry an owner-identifying field.
 * @param ownerKey - The property on `resource` that holds the owner's user id
 *   (e.g. `"userId"`, `"clientId"`, `"providerId"`).
 * @param actor - The authenticated caller.
 * @throws ForbiddenException when the actor is neither the resource owner
 *   nor an admin.
 */
export function assertOwnerOrAdmin<T, K extends keyof T>(
  resource: T,
  ownerKey: T[K] extends string ? K : never,
  actor: Actor,
): void {
  if (actor.role === "admin") return;

  if (resource[ownerKey] === actor.id) return;

  throw new ForbiddenException("Not authorized for this resource");
}
