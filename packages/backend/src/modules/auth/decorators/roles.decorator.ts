import { SetMetadata, type CustomDecorator } from "@nestjs/common";
import type { UserRole } from "@ems-portal/types";

export const ROLES_METADATA_KEY = "roles";

// Placeholder for future RBAC enforcement. Pair with RolesGuard once feature
// modules opt in per-route (e.g. @UseGuards(JwtAuthGuard, RolesGuard)).
export const Roles = (...roles: UserRole[]): CustomDecorator<string> =>
  SetMetadata(ROLES_METADATA_KEY, roles);
