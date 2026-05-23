import type { INestApplication } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { SwaggerModule, type OpenAPIObject } from "@nestjs/swagger";
import { swaggerSetup } from "./swagger.config";

describe("swaggerSetup", () => {
  const makeApp = (enabled: boolean | undefined): INestApplication => {
    const configServiceMock: Pick<ConfigService, "get"> = {
      get: jest.fn().mockReturnValue(enabled),
    };

    const appMock: Pick<INestApplication, "get"> = {
      get: jest.fn().mockReturnValue(configServiceMock),
    };

    return appMock as INestApplication;
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns undefined and does not setup swagger when APP_SWAGGER_ENABLED is false", () => {
    const app = makeApp(false);

    const createDocumentSpy = jest
      .spyOn(SwaggerModule, "createDocument")
      .mockImplementation(
        (): OpenAPIObject => ({
          openapi: "3.0.0",
          info: { title: "test", version: "1.0.0" },
          paths: {},
        }),
      );

    const setupSpy = jest
      .spyOn(SwaggerModule, "setup")
      .mockImplementation(() => undefined);

    const result = swaggerSetup(app);

    expect(result).toBeUndefined();
    expect(createDocumentSpy).not.toHaveBeenCalled();
    expect(setupSpy).not.toHaveBeenCalled();
  });

  it("returns undefined and does not setup swagger when APP_SWAGGER_ENABLED is undefined", () => {
    const app = makeApp(undefined);

    const createDocumentSpy = jest
      .spyOn(SwaggerModule, "createDocument")
      .mockImplementation(
        (): OpenAPIObject => ({
          openapi: "3.0.0",
          info: { title: "test", version: "1.0.0" },
          paths: {},
        }),
      );

    const setupSpy = jest
      .spyOn(SwaggerModule, "setup")
      .mockImplementation(() => undefined);

    const result = swaggerSetup(app);

    expect(result).toBeUndefined();
    expect(createDocumentSpy).not.toHaveBeenCalled();
    expect(setupSpy).not.toHaveBeenCalled();
  });

  it("sets up swagger and returns the docs path when APP_SWAGGER_ENABLED is true", () => {
    const app = makeApp(true);

    const openApiDoc: OpenAPIObject = {
      openapi: "3.0.0",
      info: { title: "test", version: "1.0.0" },
      paths: {},
    };

    const createDocumentSpy = jest
      .spyOn(SwaggerModule, "createDocument")
      .mockReturnValue(openApiDoc);

    const setupSpy = jest
      .spyOn(SwaggerModule, "setup")
      .mockImplementation(() => undefined);

    const result = swaggerSetup(app);

    expect(createDocumentSpy).toHaveBeenCalledTimes(1);
    expect(createDocumentSpy.mock.calls[0][0]).toBe(app);

    expect(setupSpy).toHaveBeenCalledTimes(1);
    expect(setupSpy).toHaveBeenCalledWith("api/docs", app, openApiDoc);

    expect(result).toBe("api/docs");
  });
});
