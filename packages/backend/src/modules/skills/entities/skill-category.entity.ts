import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { type SkillCategory } from "@ems-portal/types";

@Entity({ name: "skill_categories" })
export class SkillCategoryEntity implements SkillCategory {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ length: 50, unique: true })
  public name: string;
}
