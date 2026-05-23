import { Entity, Column } from "typeorm";
import { Todo, TodoStatus, TODO_STATUS_VALUES } from "@ems-portal/types";
import { BaseEntity } from "@/common/entities/base.entity";

@Entity({ name: "todo" })
export class TodoEntity extends BaseEntity implements Todo {
  @Column({ length: 100 })
  public title: string;

  @Column({ type: "text" })
  public description: string;

  @Column({
    type: "enum",
    enum: TODO_STATUS_VALUES,
    default: TodoStatus.Todo,
  })
  public status: TodoStatus;
}
