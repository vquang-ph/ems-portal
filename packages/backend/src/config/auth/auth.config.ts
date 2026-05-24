import type { ConfigService } from "@nestjs/config";
import type { JwtModuleOptions } from "@nestjs/jwt";
import {
  DEFAULT_ACCESS_EXPIRES_IN,
  DEFAULT_REFRESH_COOKIE_NAME,
  DEFAULT_REFRESH_EXPIRES_IN,
} from "./auth.constants";
import type { AuthConfig, ExpiresIn } from "./auth.types";

/**
 * Resolves auth-related configuration from environment variables.
 *
 * @param configService - Nest's ConfigService bound to the application env.
 * @returns Validated auth configuration.
 * @throws Error if APP_JWT_SECRET is not set.
 */
export const authConfig = (configService: ConfigService): AuthConfig => {
  const jwtSecret = configService.get<string>("APP_JWT_SECRET");

  if (!jwtSecret) {
    throw new Error(
      "APP_JWT_SECRET is required. Set it in your environment before starting the backend.",
    );
  }

  return {
    jwtSecret,
    accessTokenExpiresIn:
      (configService.get<string>("APP_JWT_ACCESS_EXPIRES_IN") as
        | ExpiresIn
        | undefined) ?? DEFAULT_ACCESS_EXPIRES_IN,
    refreshTokenExpiresIn:
      (configService.get<string>("APP_REFRESH_EXPIRES_IN") as
        | ExpiresIn
        | undefined) ?? DEFAULT_REFRESH_EXPIRES_IN,
    refreshCookieName:
      configService.get<string>("APP_REFRESH_COOKIE_NAME") ??
      DEFAULT_REFRESH_COOKIE_NAME,
    refreshCookieSecure:
      configService.get<string>("APP_REFRESH_COOKIE_SECURE") === "true",
    refreshCookieDomain: configService.get<string>("APP_REFRESH_COOKIE_DOMAIN"),
  };
};

/**
 * Builds the JwtModule options for signing access tokens.
 *
 * @param configService - Nest's ConfigService.
 * @returns Options consumed by JwtModule.registerAsync.
 */
export const jwtModuleConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const { jwtSecret, accessTokenExpiresIn } = authConfig(configService);

  return {
    secret: jwtSecret,
    signOptions: { expiresIn: accessTokenExpiresIn },
  };
};

/**
 * Parses an ExpiresIn string (e.g. "1h", "7d") into a milliseconds value.
 *
 * @param value - A duration like "30s", "15m", "1h", or "7d".
 * @returns The duration in milliseconds.
 * @throws Error if the format is not recognized.
 */
export const expiresInToMs = (value: ExpiresIn): number => {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) {
    throw new Error(`Invalid duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};
