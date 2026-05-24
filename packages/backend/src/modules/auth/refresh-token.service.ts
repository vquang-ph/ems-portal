import * as crypto from "crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthConfig, authConfig, expiresInToMs } from "@/config/auth";
import { RefreshTokenEntity } from "./entites/refresh-token.entity";
import { RefreshTokenRepository } from "./refresh-token.repository";

const RAW_TOKEN_BYTES = 48;

@Injectable()
export class RefreshTokenService {
  private readonly config: AuthConfig;

  public constructor(
    private readonly repository: RefreshTokenRepository,
    configService: ConfigService,
  ) {
    this.config = authConfig(configService);
  }

  /**
   * Issues the first refresh token of a new family for the given user.
   * Returns the raw (cleartext) token — the only time the caller will see it.
   *
   * @param userId - The user this token authenticates.
   * @returns The raw refresh token. Send to the client via httpOnly cookie.
   */
  public async issueNewFamily(userId: string): Promise<string> {
    const familyId = crypto.randomUUID();
    const { rawToken } = await this.create(userId, familyId);
    return rawToken;
  }

  /**
   * Atomically validates a raw refresh token and revokes it. Delegates to
   * the repository's transactional revoke so concurrent refreshes can't
   * fork the chain — the first caller consumes the row, any later caller
   * sees it already revoked and trips reuse detection (family revoked).
   *
   * @param rawToken - The raw refresh token from the client cookie.
   * @returns The validated, now-revoked record.
   * @throws UnauthorizedException for missing / expired / revoked tokens.
   */
  public async validateAndConsume(
    rawToken: string,
  ): Promise<RefreshTokenEntity> {
    const result = await this.repository.revokeIfActive(this.hash(rawToken));

    switch (result.status) {
      case "consumed":
        return result.record;
      case "not_found":
        throw new UnauthorizedException("Invalid refresh token");
      case "expired":
        throw new UnauthorizedException("Refresh token expired");
      case "reuse":
        throw new UnauthorizedException("Refresh token reuse detected");
    }
  }

  /**
   * Issues the next token in the same family and records the rotation
   * pointer on the previous record. The previous record is already revoked
   * by validateAndConsume; this only writes replacedByTokenId.
   *
   * @param previous - The previous (already revoked) token in the chain.
   * @returns The raw new refresh token.
   */
  public async rotate(previous: RefreshTokenEntity): Promise<string> {
    const { rawToken, entity: successor } = await this.create(
      previous.userId,
      previous.familyId,
    );
    previous.replacedByTokenId = successor.id;
    await this.repository.save(previous);
    return rawToken;
  }

  /**
   * Revokes a single token (best-effort logout). Idempotent — unknown or
   * already-revoked tokens silently succeed so stale cookies don't break UX.
   *
   * @param rawToken - The raw refresh token to revoke.
   */
  public async revokeOne(rawToken: string): Promise<void> {
    const record = await this.repository.findByHash(this.hash(rawToken));
    if (!record || record.revokedAt !== null) {
      return;
    }
    record.revokedAt = new Date();
    await this.repository.save(record);
  }

  /**
   * Generates and persists a refresh token in the given family. Returns the
   * raw token alongside the persisted entity so callers (e.g. rotate) can
   * read the assigned id without a second round-trip.
   *
   * @param userId - The owning user.
   * @param familyId - The family this token belongs to.
   * @returns The raw refresh token and the persisted entity.
   */
  private async create(
    userId: string,
    familyId: string,
  ): Promise<{ rawToken: string; entity: RefreshTokenEntity }> {
    const rawToken = crypto.randomBytes(RAW_TOKEN_BYTES).toString("base64url");
    const tokenHash = this.hash(rawToken);
    const expiresAt = new Date(
      Date.now() + expiresInToMs(this.config.refreshTokenExpiresIn),
    );

    const entity = await this.repository.save(
      this.repository.create({
        userId,
        familyId,
        tokenHash,
        expiresAt,
        revokedAt: null,
        replacedByTokenId: null,
      }),
    );

    return { rawToken, entity };
  }

  /**
   * Computes the sha256 hex digest used as the storage key for a raw token.
   *
   * @param rawToken - The raw refresh token.
   * @returns Hex-encoded sha256 hash.
   */
  private hash(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }
}
