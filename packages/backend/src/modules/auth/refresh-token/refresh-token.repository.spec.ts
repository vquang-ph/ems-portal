import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import { DataSource, IsNull, Repository } from "typeorm";
import { RefreshTokenEntity } from "./entities/refresh-token.entity";
import { RefreshTokenRepository } from "./refresh-token.repository";
import type { RevokeIfActiveResult } from "./types/refresh-token.types";

describe("RefreshTokenRepository", () => {
  let repository: RefreshTokenRepository;
  let mockDataSource: jest.Mocked<DataSource>;

  const mockRefreshToken: RefreshTokenEntity = {
    id: "rt_1",
    userId: "user_1",
    familyId: "fam_1",
    tokenHash: "hash1",
    expiresAt: new Date(Date.now() + 60000),
    revokedAt: null,
    replacedByTokenId: null,
    createdAt: new Date("2026-05-24T00:00:00.000Z"),
    updatedAt: null,
  };

  const mockRevokedToken: RefreshTokenEntity = {
    id: "rt_2",
    userId: "user_1",
    familyId: "fam_1",
    tokenHash: "hash2",
    expiresAt: new Date(Date.now() + 60000),
    revokedAt: new Date(),
    replacedByTokenId: null,
    createdAt: new Date("2026-05-24T00:00:00.000Z"),
    updatedAt: null,
  };

  const mockExpiredToken: RefreshTokenEntity = {
    id: "rt_3",
    userId: "user_1",
    familyId: "fam_2",
    tokenHash: "hash3",
    expiresAt: new Date(Date.now() - 60000),
    revokedAt: null,
    replacedByTokenId: null,
    createdAt: new Date("2026-05-24T00:00:00.000Z"),
    updatedAt: null,
  };

  beforeEach(async () => {
    mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
        transaction: jest.fn(),
      }),
    } as unknown as jest.Mocked<DataSource>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenRepository,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get(RefreshTokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findByHash", () => {
    it("should find refresh token by hash", async () => {
      const findOneSpy = jest
        .spyOn(repository, "findOne")
        .mockResolvedValue(mockRefreshToken);

      const result = await repository.findByHash("hash1");

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { tokenHash: "hash1" },
      });
      expect(result).toEqual(mockRefreshToken);
    });

    it("should return null when token not found", async () => {
      jest.spyOn(repository, "findOne").mockResolvedValue(null);

      const result = await repository.findByHash("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle empty token hash", async () => {
      jest.spyOn(repository, "findOne").mockResolvedValue(null);

      const result = await repository.findByHash("");

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      jest.spyOn(repository, "findOne").mockRejectedValue(error);

      await expect(repository.findByHash("hash1")).rejects.toThrow(error);
    });
  });

  describe("revokeIfActive", () => {
    it("should revoke an active token and return consumed status", async () => {
      const mockEntityManager = {
        findOne: jest.fn().mockResolvedValue(mockRefreshToken),
        save: jest.fn().mockResolvedValue(mockRefreshToken),
        transaction: jest.fn(),
      };

      (mockDataSource.createEntityManager as jest.Mock).mockReturnValue(
        mockEntityManager,
      );

      (repository as any).manager = {
        transaction: jest.fn(async (callback) => callback(mockEntityManager)),
      };

      const result = await repository.revokeIfActive("hash1");

      expect((repository as any).manager.transaction).toHaveBeenCalled();
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(
        RefreshTokenEntity,
        {
          where: { tokenHash: "hash1" },
          lock: { mode: "pessimistic_write" },
        },
      );
      expect(mockEntityManager.save).toHaveBeenCalled();
      expect(result).toEqual({
        status: "consumed",
        record: expect.any(Object),
      });
    });

    it("should return not_found when token hash doesn't exist", async () => {
      const mockEntityManager = {
        findOne: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
        transaction: jest.fn(),
      };

      (repository as any).manager = {
        transaction: jest.fn(async (callback) => callback(mockEntityManager)),
      };

      const result = await repository.revokeIfActive("nonexistent");

      expect(result).toEqual({ status: "not_found" });
      expect(mockEntityManager.save).not.toHaveBeenCalled();
    });

    it("should return reuse status and revoke family when token already revoked", async () => {
      const mockEntityManager = {
        findOne: jest.fn().mockResolvedValue(mockRevokedToken),
        update: jest.fn().mockResolvedValue({ affected: 5 }),
        transaction: jest.fn(),
      };

      (repository as any).manager = {
        transaction: jest.fn(async (callback) => callback(mockEntityManager)),
      };

      const result = await repository.revokeIfActive("hash2");

      expect(mockEntityManager.update).toHaveBeenCalledWith(
        RefreshTokenEntity,
        { familyId: "fam_1", revokedAt: IsNull() },
        { revokedAt: expect.any(Date) },
      );
      expect(result).toEqual({
        status: "reuse",
        familyId: "fam_1",
      });
    });

    it("should return expired status when token has expired", async () => {
      const mockEntityManager = {
        findOne: jest.fn().mockResolvedValue(mockExpiredToken),
        save: jest.fn(),
        transaction: jest.fn(),
      };

      (repository as any).manager = {
        transaction: jest.fn(async (callback) => callback(mockEntityManager)),
      };

      const result = await repository.revokeIfActive("hash3");

      expect(result).toEqual({ status: "expired" });
      expect(mockEntityManager.save).not.toHaveBeenCalled();
    });

    it("should handle transaction errors", async () => {
      const error = new Error("Transaction error");

      (repository as any).manager = {
        transaction: jest.fn().mockRejectedValue(error),
      };

      await expect(repository.revokeIfActive("hash1")).rejects.toThrow(error);
    });

    it("should use pessimistic write lock", async () => {
      const mockEntityManager = {
        findOne: jest.fn().mockResolvedValue(null),
        transaction: jest.fn(),
      };

      (repository as any).manager = {
        transaction: jest.fn(async (callback) => callback(mockEntityManager)),
      };

      await repository.revokeIfActive("hash1");

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(
        RefreshTokenEntity,
        expect.objectContaining({
          lock: { mode: "pessimistic_write" },
        }),
      );
    });

    it("should set revokedAt to current date when consuming token", async () => {
      const beforeCall = Date.now();
      const activeToken = {
        id: "rt_4",
        userId: "user_1",
        familyId: "fam_1",
        tokenHash: "hash4",
        expiresAt: new Date(Date.now() + 60000),
        revokedAt: null,
        replacedByTokenId: null,
        createdAt: new Date("2026-05-24T00:00:00.000Z"),
        updatedAt: null,
      };

      const mockEntityManager = {
        findOne: jest.fn().mockResolvedValue(activeToken),
        save: jest.fn().mockImplementation((record) => {
          activeToken.revokedAt = record.revokedAt;
          return Promise.resolve(record);
        }),
        update: jest.fn().mockResolvedValue({ affected: 5 }),
        transaction: jest.fn(),
      };

      (repository as any).manager = {
        transaction: jest.fn(async (callback) => {
          const result = await callback(mockEntityManager);
          return result;
        }),
      };

      const result = await repository.revokeIfActive("hash4");
      const afterCall = Date.now();

      expect(result.status).toBe("consumed");
      if (result.status === "consumed" && result.record) {
        expect(result.record.revokedAt).not.toBeNull();
        expect(result.record.revokedAt!.getTime()).toBeGreaterThanOrEqual(
          beforeCall,
        );
        expect(result.record.revokedAt!.getTime()).toBeLessThanOrEqual(
          afterCall,
        );
      }
    });
  });

  describe("revokeFamily", () => {
    it("should revoke all active tokens in a family", async () => {
      const updateSpy = jest.spyOn(repository, "update").mockResolvedValue({
        affected: 3,
      } as any);

      await repository.revokeFamily("fam_1");

      expect(updateSpy).toHaveBeenCalledWith(
        { familyId: "fam_1", revokedAt: IsNull() },
        { revokedAt: expect.any(Date) },
      );
    });

    it("should handle when no active tokens exist in family", async () => {
      const updateSpy = jest.spyOn(repository, "update").mockResolvedValue({
        affected: 0,
      } as any);

      await repository.revokeFamily("fam_999");

      expect(updateSpy).toHaveBeenCalled();
    });

    it("should use IsNull to filter non-revoked tokens", async () => {
      const updateSpy = jest.spyOn(repository, "update").mockResolvedValue({
        affected: 2,
      } as any);

      await repository.revokeFamily("fam_1");

      const [whereClause] = updateSpy.mock.calls[0] as any;
      expect(whereClause.revokedAt).toEqual(IsNull());
    });

    it("should set revokedAt to current date", async () => {
      const beforeCall = Date.now();
      const updateSpy = jest.spyOn(repository, "update").mockResolvedValue({
        affected: 1,
      } as any);

      await repository.revokeFamily("fam_1");
      const afterCall = Date.now();

      const [, updateData] = updateSpy.mock.calls[0] as any;
      expect(updateData.revokedAt).not.toBeNull();
      expect(updateData.revokedAt.getTime()).toBeGreaterThanOrEqual(beforeCall);
      expect(updateData.revokedAt.getTime()).toBeLessThanOrEqual(afterCall);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      jest.spyOn(repository, "update").mockRejectedValue(error);

      await expect(repository.revokeFamily("fam_1")).rejects.toThrow(error);
    });

    it("should handle empty family ID", async () => {
      const updateSpy = jest.spyOn(repository, "update").mockResolvedValue({
        affected: 0,
      } as any);

      await repository.revokeFamily("");

      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
