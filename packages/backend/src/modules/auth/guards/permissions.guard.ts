import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasPermission, type Permission } from "@ems-portal/types";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { PERMISSIONS_METADATA_KEY } from "../decorators/require-permissions.decorator";
import type { UserEntity } from "@/modules/user/entities/user.entity";

@Injectable()
export class PermissionsGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  /**
   * Allows public routes through unchecked; for protected routes, verifies
   * the authenticated user holds every permission listed by
   * `@RequirePermissions()`. Admin role bypasses the check.
   *
   * @param context - The Nest execution context for the current request.
   * @returns `true` when the caller is authorized.
   * @throws ForbiddenException when no authenticated user is present or
   *   when the caller lacks any required permission.
   */
  public canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Re-check @Public() here: JwtAuthGuard already short-circuits public routes, but
    // it does so without populating req.user. If this guard proceeds on a public route
    // that also declares @RequirePermissions(), the missing user would cause a false 403.
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permission metadata = "authenticated but no capability gate". The route is
    // protected by JwtAuthGuard alone — any valid token is sufficient.
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: UserEntity }>();
    const user = request.user;
    if (!user) throw new ForbiddenException("Authentication required");

    // Admin implicit grant — the only place in the codebase where admin gets blanket
    // access. Keeping it here (not in ROLE_PERMISSIONS) means adding a new permission
    // never requires touching the admin grant.
    if (user.role === "admin") return true;

    // AND semantics: the caller must hold every listed permission, not just one.
    const ok = required.every((perm) => hasPermission(user.role, perm));
    if (!ok) throw new ForbiddenException("Insufficient permissions");
    return true;
  }
}
