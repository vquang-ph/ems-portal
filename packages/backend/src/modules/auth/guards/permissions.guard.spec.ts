import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PermissionsGuard } from "./permissions.guard";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { PERMISSIONS_METADATA_KEY } from "../decorators/require-permissions.decorator";
import type { Permission } from "@ems-portal/types";
import { UserEntity } from "@/modules/user/entites/user.entity";

function buildContext(
  user: Partial<UserEntity> | undefined,
  isPublic = false,
  required?: Permission[],
) {
  const reflector = {
    getAllAndOverride: jest.fn((key: string) => {
      if (key === IS_PUBLIC_KEY) return isPublic;
      if (key === PERMISSIONS_METADATA_KEY) return required;
      return undefined;
    }),
  } as unknown as Reflector;

  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as never;

  return { reflector, context };
}

describe("PermissionsGuard", () => {
  it("returns true for public routes without inspecting user", () => {
    const { reflector, context } = buildContext(undefined, true);
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it("returns true when no @RequirePermissions metadata is set", () => {
    const user = { role: "client" } as UserEntity;
    const { reflector, context } = buildContext(user, false, undefined);
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it("throws ForbiddenException when user is missing on a permission-gated route", () => {
    const { reflector, context } = buildContext(undefined, false, [
      "provider_profile:read:any",
    ]);
    const guard = new PermissionsGuard(reflector);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("returns true for admin regardless of required permissions", () => {
    const user = { role: "admin" } as UserEntity;
    const { reflector, context } = buildContext(user, false, [
      "user:delete:any",
    ]);
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it("returns true when the role holds all required permissions", () => {
    const user = { role: "client" } as UserEntity;
    const { reflector, context } = buildContext(user, false, [
      "provider_profile:read:any",
    ]);
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(context)).toBe(true);
  });

  it("throws ForbiddenException when the role is missing a required permission", () => {
    const user = { role: "client" } as UserEntity;
    const { reflector, context } = buildContext(user, false, [
      "user:delete:any",
    ]);
    const guard = new PermissionsGuard(reflector);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("enforces AND semantics — all required permissions must be held", () => {
    const user = { role: "client" } as UserEntity;
    // client holds "provider_profile:read:any" but not "user:delete:any"
    const { reflector, context } = buildContext(user, false, [
      "provider_profile:read:any",
      "user:delete:any",
    ]);
    const guard = new PermissionsGuard(reflector);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
