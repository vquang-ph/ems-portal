import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "@/common/entities/base.entity";
import { UserEntity } from "@/modules/user/entites/user.entity";

@Entity({ name: "refresh_tokens" })
@Index(["familyId"])
export class RefreshTokenEntity extends BaseEntity {
  @Column({ name: "user_id", type: "uuid" })
  public userId: string;

  // All refresh tokens descended from a single login share a familyId. When a
  // rotated (revoked) token is replayed we revoke the whole family — that's
  // our reuse-detection signal.
  @Column({ name: "family_id", type: "uuid" })
  public familyId: string;

  // sha256(rawToken) hex. Raw tokens are never persisted; only their hash is.
  @Index({ unique: true })
  @Column({ name: "token_hash", type: "text" })
  public tokenHash: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  public expiresAt: Date;

  @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
  public revokedAt: Date | null;

  @Column({ name: "replaced_by_token_id", type: "uuid", nullable: true })
  public replacedByTokenId: string | null;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  public user: UserEntity;
}
