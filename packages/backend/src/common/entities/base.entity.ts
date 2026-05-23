import {
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Base entity class with UUID as primary key and created_at and updated_at columns
 */
export abstract class BaseEntity {
  @Index({ unique: true })
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp", nullable: false })
  public createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp", nullable: true })
  public updatedAt: Date | null;
}
