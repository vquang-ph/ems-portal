import { Column, Entity, Index } from "typeorm";
import { USER_ROLE_VALUES, type User, type UserRole } from "@ems-portal/types";
import { BaseEntity } from "@/common/entities/base.entity";

type UserStatus = "active" | "suspended" | "deleted";

@Entity({ name: "users" })
export class UserEntity extends BaseEntity implements User {
  @Index({ unique: true })
  @Column({ length: 254 })
  public email: string;

  @Column({ length: 120 })
  public name: string;

  @Column({ type: "enum", enum: USER_ROLE_VALUES })
  public role: UserRole;

  @Column({ name: "password_hash", type: "text" })
  public passwordHash: string;

  @Column({
    type: "enum",
    enum: ["active", "suspended", "deleted"],
    default: "active",
  })
  public status: UserStatus;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  public deletedAt: Date | null;

  @Column({ name: "email_verified_at", type: "timestamptz", nullable: true })
  public emailVerifiedAt: Date | null;

  @Column({ name: "last_login_at", type: "timestamptz", nullable: true })
  public lastLoginAt: Date | null;
}
