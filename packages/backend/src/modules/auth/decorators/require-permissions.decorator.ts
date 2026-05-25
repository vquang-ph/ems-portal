import { SetMetadata } from "@nestjs/common";
import type { Permission } from "@ems-portal/types";

export const PERMISSIONS_METADATA_KEY = "auth:required-permissions";

/**
 * Declares the permissions a caller must hold to invoke this handler.
 * All listed permissions must be satisfied (AND semantics).
 */
export const RequirePermissions = (
  ...permissions: Permission[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSIONS_METADATA_KEY, permissions);
