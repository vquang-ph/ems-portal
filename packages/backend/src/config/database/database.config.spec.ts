import type { ConfigService } from "@nestjs/config";
import { databaseConfig } from "./database.config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";

describe("databaseConfig", () => {
  // Mock ConfigService to return values from a simple object
  const makeConfigService = (
    values: Record<string, unknown>,
  ): jest.Mocked<ConfigService> => {
    return {
      get: jest.fn((key: string) => values[key]),
    } as unknown as jest.Mocked<ConfigService>;
  };

  it("extracts APP_DATABASE_URL and passes it to the builder", () => {
    const configService = makeConfigService({
      APP_DATABASE_URL: "postgres://user:pass@localhost:5432/db",
    });

    const result = databaseConfig(configService);

    // Assuming buildDataSourceOptions processes the URL correctly
    // We check that the result looks correct (integration check)
    const expected: Partial<TypeOrmModuleOptions> = {
      type: "postgres",
      url: "postgres://user:pass@localhost:5432/db",
    };

    expect(result).toMatchObject(expected);

    // Verify configService was queried for the URL
    expect(configService.get).toHaveBeenCalledWith("APP_DATABASE_URL");
  });

  it("extracts individual connection fields and passes them to the builder", () => {
    const configService = makeConfigService({
      APP_DATABASE_HOST: "localhost",
      APP_DATABASE_PORT: 5432,
      APP_DATABASE_USER: "user",
      APP_DATABASE_PASSWORD: "password",
      APP_DATABASE_NAME: "testdb",
    });

    const result = databaseConfig(configService);

    const expected: Partial<TypeOrmModuleOptions> = {
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "user",
      password: "password",
      database: "testdb",
    };

    expect(result).toMatchObject(expected);

    expect(configService.get).toHaveBeenCalledWith("APP_DATABASE_HOST");
    expect(configService.get).toHaveBeenCalledWith("APP_DATABASE_PORT");
    expect(configService.get).toHaveBeenCalledWith("APP_DATABASE_USER");
    expect(configService.get).toHaveBeenCalledWith("APP_DATABASE_PASSWORD");
    expect(configService.get).toHaveBeenCalledWith("APP_DATABASE_NAME");
  });
});
