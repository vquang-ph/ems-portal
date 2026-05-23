import type { ConfigService } from "@nestjs/config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { buildDataSourceOptions } from "./database.builder";

/**
 * Database configuration for NestJS TypeOrmModule
 * @param configService
 * @returns TypeOrmModuleOptions
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
