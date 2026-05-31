import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { type ProficiencyLevel } from "@ems-portal/types";
import { ProviderProfileEntity } from "./provider-profile.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";

@Entity({ name: "provider_skills" })
export class ProviderSkillEntity {
  @PrimaryColumn({ name: "profile_id", type: "uuid" })
  public profileId: string;

  @PrimaryColumn({ name: "skill_id", type: "integer" })
  public skillId: number;

  @Column({ type: "varchar", length: 10 })
  public level: ProficiencyLevel;

  @Column({ name: "years_of_experience", default: 0 })
  public yearsOfExperience: number;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @ManyToOne(() => ProviderProfileEntity, (p) => p.providerSkills, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "profile_id" })
  public profile: ProviderProfileEntity;

  @ManyToOne(() => SkillEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "skill_id" })
  public skill: SkillEntity;
}
