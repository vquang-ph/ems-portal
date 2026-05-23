import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const APP_API_SPECS_PATH = "api/docs";

export const swaggerSetup = (app: INestApplication): string | undefined => {
  const configService: ConfigService = app.get(ConfigService);

  const isSwaggerEnabled =
    configService.get<boolean>("APP_SWAGGER_ENABLED") ?? false;

  if (!isSwaggerEnabled) {
    return;
  }

  const openApiConfig = new DocumentBuilder()
    .setTitle("Boilerplate Typescript API")
    .setDescription("The Boilerplate Typescript API documentation")
    .build();

  const openApiDoc = SwaggerModule.createDocument(app, openApiConfig);

  SwaggerModule.setup(APP_API_SPECS_PATH, app, openApiDoc);

  return APP_API_SPECS_PATH;
};
