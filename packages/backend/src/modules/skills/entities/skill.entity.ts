import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { type Skill } from "@ems-portal/types";
import { SkillCategoryEntity } from "./skill-category.entity";

@Entity({ name: "skills" })
export class SkillEntity implements Skill {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ length: 100, unique: true })
  public name: string;

  @Column({ name: "category_id" })
  public categoryId: number;

  @ManyToOne(() => SkillCategoryEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "category_id" })
  public category: SkillCategoryEntity;
}
