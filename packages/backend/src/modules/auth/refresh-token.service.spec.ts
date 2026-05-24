import * as crypto from "crypto";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { RefreshTokenEntity } from "./entites/refresh-token.entity";
import { RefreshTokenRepository } from "./refresh-token.repository";
import { RefreshTokenService } from "./refresh-token.service";

const hash = (raw: string): string =>
  crypto.createHash("sha256").update(raw).digest("hex");

const buildRecord = (
  overrides: Partial<RefreshTokenEntity> = {},
): RefreshTokenEntity => {
  const record = new RefreshTokenEntity();
  record.id = "rt_1";
  record.userId = "user_1";
  record.familyId = "fam_1";
  record.tokenHash = "h";
  record.expiresAt = new Date(Date.now() + 60_000);
  record.revokedAt = null;
  record.replacedByTokenId = null;
  record.createdAt = new Date();
  record.updatedAt = null;
  Object.assign(record, overrides);
  return record;
};

describe("RefreshTokenService", () => {
  let service: RefreshTokenService;
  let repository: jest.Mocked<RefreshTokenRepository>;

  beforeEach(async () => {
    const configValues: Record<string, string> = {
      APP_JWT_SECRET: "test-secret",
      APP_REFRESH_EXPIRES_IN: "7d",
      APP_REFRESH_COOKIE_NAME: "ems.refresh",
      APP_REFRESH_COOKIE_SECURE: "false",
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: RefreshTokenRepository,
          useValue: {
            findByHash: jest.fn(),
            revokeIfActive: jest.fn(),
            revokeFamily: jest.fn().mockResolvedValue(undefined),
            save: jest.fn().mockImplementation((entity) => entity),
            create: jest.fn().mockImplementation((entity) => entity),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => configValues[key]),
          },
        },
      ],
    }).compile();

    service = module.get(RefreshTokenService);
    repository = module.get(RefreshTokenRepository);

    jest.clearAllMocks();
  });

  describe("issueNewFamily", () => {
    it("persists a record with a fresh familyId and returns the raw token", async () => {
      let savedRecord: RefreshTokenEntity | null = null;
      (repository.save as jest.Mock).mockImplementation((entity) => {
        savedRecord = entity as RefreshTokenEntity;
        return savedRecord;
      });

      const raw = await service.issueNewFamily("user_1");

      expect(typeof raw).toBe("string");
      expect(raw.length).toBeGreaterThan(0);
      expect(savedRecord).not.toBeNull();
      expect(savedRecord!.userId).toBe("user_1");
      expect(savedRecord!.tokenHash).toBe(hash(raw));
      expect(savedRecord!.revokedAt).toBeNull();
      expect(savedRecord!.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("validateAndConsume", () => {
    it("returns the record when the repository reports it consumed", async () => {
      const record = buildRecord();
      repository.revokeIfActive.mockResolvedValue({
        status: "consumed",
        record,
      });

      await expect(service.validateAndConsume("raw")).resolves.toBe(record);
    });

    it("throws UnauthorizedException when the token is unknown", async () => {
      repository.revokeIfActive.mockResolvedValue({ status: "not_found" });

      await expect(service.validateAndConsume("raw")).rejects.toThrow(
        "Invalid refresh token",
      );
    });

    it("throws reuse-detection error when the repository signals reuse", async () => {
      repository.revokeIfActive.mockResolvedValue({
        status: "reuse",
        familyId: "fam_1",
      });

      await expect(service.validateAndConsume("raw")).rejects.toThrow(
        "Refresh token reuse detected",
      );
    });

    it("throws UnauthorizedException when the token is expired", async () => {
      repository.revokeIfActive.mockResolvedValue({ status: "expired" });

      await expect(service.validateAndConsume("raw")).rejects.toThrow(
        "Refresh token expired",
      );
    });
  });

  describe("rotate", () => {
    it("issues a successor in the same family and links the previous record", async () => {
      const previous = buildRecord();
      let nextId = 1;
      (repository.save as jest.Mock).mockImplementation((entity) => {
        if (!entity.id) {
          entity.id = `rt_${++nextId}`;
        }
        return entity;
      });

      const newRaw = await service.rotate(previous);

      expect(typeof newRaw).toBe("string");
      expect(previous.replacedByTokenId).toBe("rt_2");
      // Revocation is owned by validateAndConsume, not rotate.
      expect(previous.revokedAt).toBeNull();
    });
  });

  describe("revokeOne", () => {
    it("marks the matching record revoked", async () => {
      const record = buildRecord();
      repository.findByHash.mockResolvedValue(record);

      await service.revokeOne("raw");

      expect(record.revokedAt).toBeInstanceOf(Date);
      expect(repository.save).toHaveBeenCalledWith(record);
    });

    it("is a no-op for unknown tokens", async () => {
      repository.findByHash.mockResolvedValue(null);
      await service.revokeOne("raw");
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("is a no-op for already-revoked tokens", async () => {
      const record = buildRecord({ revokedAt: new Date() });
      repository.findByHash.mockResolvedValue(record);
      await service.revokeOne("raw");
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
