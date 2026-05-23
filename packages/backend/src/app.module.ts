import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseConfig } from "./config/database.config";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { TypeOrmExceptionFilter } from "./common/filters/typeorm-exception.filter";
import { HealthModule } from "./modules/health/health.module";
import { MetricModule } from "./modules/metric/metric.module";
import { HelloWorldModule } from "./modules/hello-world/hello-world.module";
import { TodoModule } from "./modules/todo/todo.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),

    HealthModule,
    MetricModule,
    HelloWorldModule,
    TodoModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: TypeOrmExceptionFilter,
    },
  ],
})
export class AppModule {}
