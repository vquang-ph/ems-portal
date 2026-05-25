import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import type { Observable } from "rxjs";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  public constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Allows the request through when the handler or controller is marked
   * `@Public()`; otherwise enforces a valid JWT via the Passport strategy.
   *
   * @param context - The Nest execution context for the current request.
   * @returns `true` for public routes; delegates to Passport otherwise.
   */
  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
