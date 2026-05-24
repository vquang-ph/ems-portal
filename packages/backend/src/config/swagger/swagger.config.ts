import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import {
  OPENAPI_DESCRIPTION,
  OPENAPI_SPEC_PATH,
  OPENAPI_TITLE,
} from "./swagger.constants";

/**
 * Mounts the Swagger UI at OPENAPI_SPEC_PATH when APP_SWAGGER_ENABLED is true.
 *
 * @param app - The Nest application instance.
 * @returns The mounted spec path, or undefined when Swagger is disabled.
 */
export const swaggerSetup = (app: INestApplication): string | undefined => {
  const configService: ConfigService = app.get(ConfigService);

  const isSwaggerEnabled =
    configService.get<boolean>("APP_SWAGGER_ENABLED") ?? false;

  if (!isSwaggerEnabled) {
    return;
  }

  const openApiConfig = new DocumentBuilder()
    .setTitle(OPENAPI_TITLE)
    .setDescription(OPENAPI_DESCRIPTION)
    .build();

  const openApiDoc = SwaggerModule.createDocument(app, openApiConfig);

  SwaggerModule.setup(OPENAPI_SPEC_PATH, app, openApiDoc);

  return OPENAPI_SPEC_PATH;
};
