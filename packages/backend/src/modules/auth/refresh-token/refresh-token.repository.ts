import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, IsNull, Repository } from "typeorm";
import { RefreshTokenEntity } from "./entities/refresh-token.entity";
import { RevokeIfActiveResult } from "./types/refresh-token.types";

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshTokenEntity> {
  public constructor(@InjectDataSource() private dataSource: DataSource) {
    super(RefreshTokenEntity, dataSource.createEntityManager());
  }

  /**
   * Finds a refresh token record by its sha256 hash.
   *
   * @param tokenHash - The sha256 hex digest of the raw refresh token.
   * @returns The matching record, or null if none exists.
   */
  public async findByHash(
    tokenHash: string,
  ): Promise<RefreshTokenEntity | null> {
    return this.findOne({ where: { tokenHash } });
  }

  /**
   * Atomically validates a refresh token and revokes it. Wraps the
   * SELECT + UPDATE in a transaction with a pessimistic_write row lock so
   * concurrent refreshes of the same token are serialized — the first
   * caller wins ("consumed") and any later caller sees the row already
   * revoked, which we treat as token reuse and revoke the whole family.
   * This is the single place validate→revoke may happen; splitting it
   * across two queries re-opens the race window that lets an attacker
   * fork the chain.
   *
   * @param tokenHash - The sha256 hex digest of the raw refresh token.
   * @returns A tagged result describing what happened to the row.
   */
  public async revokeIfActive(
    tokenHash: string,
  ): Promise<RevokeIfActiveResult> {
    return this.manager.transaction(async (em) => {
      const record = await em.findOne(RefreshTokenEntity, {
        where: { tokenHash },
        lock: { mode: "pessimistic_write" },
      });

      if (!record) {
        return { status: "not_found" };
      }

      if (record.revokedAt !== null) {
        await em.update(
          RefreshTokenEntity,
          { familyId: record.familyId, revokedAt: IsNull() },
          { revokedAt: new Date() },
        );
        return { status: "reuse", familyId: record.familyId };
      }

      if (record.expiresAt.getTime() <= Date.now()) {
        return { status: "expired" };
      }

      record.revokedAt = new Date();
      await em.save(record);
      return { status: "consumed", record };
    });
  }

  /**
   * Revokes every still-active token in the given family. Kept as a
   * primitive for admin/force-logout flows; reuse-detection revokes the
   * family from inside revokeIfActive's transaction directly.
   *
   * @param familyId - The familyId shared by all tokens in the chain.
   */
  public async revokeFamily(familyId: string): Promise<void> {
    await this.update(
      { familyId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }
}
