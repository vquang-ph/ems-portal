import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";

function buildContext() {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn(),
  } as unknown as ExecutionContext;
}

function buildReflector(isPublic: boolean) {
  return {
    getAllAndOverride: jest.fn().mockReturnValue(isPublic),
  } as unknown as Reflector;
}

/**
 * Spy on the actual parent prototype `JwtAuthGuard` extends. Going through
 * `AuthGuard("jwt").prototype` would be brittle if @nestjs/passport ever
 * stopped memoizing the mixin — this anchors directly to the inheritance
 * chain so the test fails loudly instead of silently no-opping.
 */
function spyOnParentCanActivate(returnValue: boolean) {
  const parentProto = Object.getPrototypeOf(JwtAuthGuard.prototype) as {
    canActivate: (ctx: ExecutionContext) => boolean;
  };
  return jest.spyOn(parentProto, "canActivate").mockReturnValue(returnValue);
}

describe("JwtAuthGuard", () => {
  it("returns true and never delegates to Passport for @Public() routes", () => {
    const reflector = buildReflector(true);
    const guard = new JwtAuthGuard(reflector);
    const superSpy = spyOnParentCanActivate(false);

    const result = guard.canActivate(buildContext());

    expect(result).toBe(true);
    expect(superSpy).not.toHaveBeenCalled();
    superSpy.mockRestore();
  });

  it("delegates to Passport canActivate when route is not @Public()", () => {
    const reflector = buildReflector(false);
    const guard = new JwtAuthGuard(reflector);
    const superSpy = spyOnParentCanActivate(true);

    const result = guard.canActivate(buildContext());

    expect(superSpy).toHaveBeenCalledTimes(1);
    expect(superSpy).toHaveBeenCalledWith(expect.any(Object));
    expect(result).toBe(true);
    superSpy.mockRestore();
  });
});
