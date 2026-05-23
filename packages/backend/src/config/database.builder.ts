import type { DataSourceOptions } from "typeorm";
/**
 * Helper function to build TypeORM DataSourceOptions from environment variables.
 * @param env - Environment variables
 * @returns DataSourceOptions
 */
export const buildDataSourceOptions = (
  env: Record<string, string | undefined>,
): DataSourceOptions => {
  const commonSettings: DataSourceOptions = {
    type: "mysql",
    migrations: [__dirname + "/../database/migrations/*.{t,j}s"],
    entities: [__dirname + "/../modules/**/*.entity.{t,j}s"],
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
