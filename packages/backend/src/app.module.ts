import * as path from "path";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseConfig } from "./config/database";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { TypeOrmExceptionFilter } from "./common/filters/typeorm-exception.filter";
import { AuthModule } from "./modules/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { MetricModule } from "./modules/metric/metric.module";
import { TodoModule } from "./modules/todo/todo.module";
import { UserModule } from "./modules/user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        // Repo-root .env (monorepo single source of truth) takes precedence.
        path.resolve(process.cwd(), "../../.env"),

        // Fallback: a package-local .env if someone overrides it.
        ".env",
      ],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),

    HealthModule,
    MetricModule,
    UserModule,
    AuthModule,
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
