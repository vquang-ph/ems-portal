import type { ConfigService } from "@nestjs/config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { buildDataSourceOptions } from "./database.builder";

/**
 * Resolves the runtime database configuration for NestJS TypeOrmModule.
 *
 * @param configService - Nest's ConfigService bound to the application env.
 * @returns TypeOrmModuleOptions consumed by TypeOrmModule.forRootAsync.
 */
export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const env: Record<string, string | undefined> = {
    APP_DATABASE_URL: configService.get<string>("APP_DATABASE_URL"),
    APP_DATABASE_HOST: configService.get<string>("APP_DATABASE_HOST"),
    APP_DATABASE_PORT: configService.get<string>("APP_DATABASE_PORT"),
    APP_DATABASE_USER: configService.get<string>("APP_DATABASE_USER"),
    APP_DATABASE_PASSWORD: configService.get<string>("APP_DATABASE_PASSWORD"),
    APP_DATABASE_NAME: configService.get<string>("APP_DATABASE_NAME"),
  };

  return buildDataSourceOptions(env);
};
