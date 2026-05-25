import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "auth:is-public";

/**
 * Marks a route (or controller) as accessible without authentication.
 * Routes without this decorator require a valid JWT.
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
