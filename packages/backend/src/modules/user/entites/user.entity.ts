import { Column, Entity, Index } from "typeorm";
import { USER_ROLE_VALUES, type User, type UserRole } from "@ems-portal/types";
import { BaseEntity } from "@/common/entities/base.entity";

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
}
