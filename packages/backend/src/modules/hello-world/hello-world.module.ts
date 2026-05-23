import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HelloWorldController } from "./hello-world.controller";
import { HelloWorldService } from "./hello-world.service";
import { HelloWorldEntity } from "./entites/hello-world.entity";
import { HelloWorldRepository } from "./hello-world.repository";

@Module({
  imports: [TypeOrmModule.forFeature([HelloWorldEntity])],
  controllers: [HelloWorldController],
  providers: [HelloWorldService, HelloWorldRepository],
})
export class HelloWorldModule {}
