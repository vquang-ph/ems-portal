import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("hello-world")
export class HelloWorldEntity extends BaseEntity {
  @Column()
  public name: string;
}
