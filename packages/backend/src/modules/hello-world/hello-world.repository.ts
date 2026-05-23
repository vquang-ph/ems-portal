import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { HelloWorldEntity } from "./entites/hello-world.entity";

@Injectable()
export class HelloWorldRepository extends Repository<HelloWorldEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(HelloWorldEntity, dataSource.createEntityManager());
  }
}
