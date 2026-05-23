import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { swaggerSetup } from "./config/swagger.config";
import { Logger } from "@nestjs/common";

async function bootstrap(): Promise<void> {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix("api");

  const swaggerPath = swaggerSetup(app);

  app.enableCors({
    origin: true,
    methods: "GET,PATCH,POST,DELETE",
  });

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");

  const appUrl = await app.getUrl();
  const apiDocUrl: string = swaggerPath ? `${appUrl}/${swaggerPath}` : "";

  logger.log("Application is running at: " + appUrl);

  if (apiDocUrl) {
    logger.log("Swagger API documentation is available at: " + apiDocUrl);
  }
}

bootstrap().catch((err) => {
  console.error("Error starting server:", err);
});
