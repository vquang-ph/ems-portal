import type { ConfigService } from "@nestjs/config";
import type { JwtModuleOptions } from "@nestjs/jwt";

const DEFAULT_EXPIRES_IN = "1d";

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

export const authConfig = (configService: ConfigService): AuthConfig => {
  const jwtSecret = configService.get<string>("APP_JWT_SECRET");

  if (!jwtSecret) {
    throw new Error(
      "APP_JWT_SECRET is required. Set it in your environment before starting the backend.",
    );
  }

  return {
    jwtSecret,
    jwtExpiresIn:
      configService.get<string>("APP_JWT_EXPIRES_IN") ?? DEFAULT_EXPIRES_IN,
  };
};

export const jwtModuleConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const { jwtSecret, jwtExpiresIn } = authConfig(configService);

  return {
    secret: jwtSecret,
    signOptions: {
      expiresIn: jwtExpiresIn as `${number}${"s" | "m" | "h" | "d"}`,
    },
  };
};
