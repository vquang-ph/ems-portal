import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserRole } from "@ems-portal/types";
import type { UserEntity } from "@/modules/user/entites/user.entity";
import { ROLES_METADATA_KEY } from "../decorators/roles.decorator";

// Placeholder. Not wired globally — opt in per-route once feature modules
// need role-based authorization. Always pair with JwtAuthGuard so request.user
// is populated before this runs.
@Injectable()
export class RolesGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: UserEntity }>();

    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException("Insufficient role");
    }

    return true;
  }
}
