import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { type ProviderProfile } from "@ems-portal/types";
import { BaseEntity } from "@/common/entities/base.entity";
import { UserEntity } from "@/modules/user/entites/user.entity";
import { ProviderSkillEntity } from "./provider-skill.entity";

@Entity({ name: "provider_profiles" })
export class ProviderProfileEntity
  extends BaseEntity
  implements ProviderProfile
{
  @Column({ name: "user_id", type: "uuid" })
  public userId: string;

  @Column({ type: "text", nullable: true })
  public bio: string | null;

  @Column({ type: "numeric", precision: 9, scale: 6, nullable: true })
  public latitude: number | null;

  @Column({ type: "numeric", precision: 9, scale: 6, nullable: true })
  public longitude: number | null;

  @Column({ name: "is_available", default: true })
  public isAvailable: boolean;

  @Column({
    name: "hourly_rate_min",
    type: "numeric",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  public hourlyRateMin: number | null;

  @Column({
    name: "hourly_rate_max",
    type: "numeric",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  public hourlyRateMax: number | null;

  @Column({
    name: "rating_average",
    type: "numeric",
    precision: 3,
    scale: 2,
    default: 0,
  })
  public ratingAverage: number;

  @Column({ name: "rating_count", default: 0 })
  public ratingCount: number;

  @Column({ name: "completed_engagements_count", default: 0 })
  public completedEngagementsCount: number;

  @Column({ name: "verification_status", length: 20, default: "unverified" })
  public verificationStatus: "unverified" | "pending" | "verified";

  @Column({ name: "verified_at", type: "timestamptz", nullable: true })
  public verifiedAt: Date | null;

  @ManyToOne(() => UserEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  public user: UserEntity;

  @OneToMany(() => ProviderSkillEntity, (ps) => ps.profile, { cascade: true })
  public providerSkills: ProviderSkillEntity[];
}
