import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { TodoEntity } from "./entites/todo.entity";
import { InjectDataSource } from "@nestjs/typeorm";

@Injectable()
export class TodoRepository extends Repository<TodoEntity> {
  public constructor(@InjectDataSource() private dataSource: DataSource) {
    super(TodoEntity, dataSource.createEntityManager());
  }
}
