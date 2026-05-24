import type { DataSourceOptions } from "typeorm";

/**
 * Builds TypeORM DataSourceOptions from a flat environment-variable map.
 * Shared by the runtime resolver (databaseConfig) and the standalone CLI
 * DataSource. APP_DATABASE_URL takes precedence over the host/port/etc vars.
 *
 * @param env - Flat map of APP_DATABASE_* environment variables.
 * @returns Postgres DataSourceOptions ready to hand to TypeORM.
 */
export const buildDataSourceOptions = (
  env: Record<string, string | undefined>,
): DataSourceOptions => {
  const commonSettings: DataSourceOptions = {
    type: "postgres",
    migrations: [__dirname + "/../../database/migrations/*.{t,j}s"],
    entities: [__dirname + "/../../modules/**/*.entity.{t,j}s"],
    synchronize: false,
    logging: true,
  };

  if (env.APP_DATABASE_URL) {
    return {
      ...commonSettings,
      url: env.APP_DATABASE_URL,
    };
  }

  return {
    ...commonSettings,
    host: env.APP_DATABASE_HOST,
    port: Number(env.APP_DATABASE_PORT),
    username: env.APP_DATABASE_USER,
    password: env.APP_DATABASE_PASSWORD,
    database: env.APP_DATABASE_NAME,
  };
};
