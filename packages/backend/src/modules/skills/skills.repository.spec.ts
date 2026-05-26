import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { In } from "typeorm";
import { SkillCategoryEntity } from "./entities/skill-category.entity";
import { SkillEntity } from "./entities/skill.entity";
import { SkillsRepository } from "./skills.repository";

describe("SkillsRepository", () => {
  let repository: SkillsRepository;
  let mockCategoryRepo: jest.Mocked<Partial<Repository<SkillCategoryEntity>>>;
  let mockSkillRepo: jest.Mocked<Partial<Repository<SkillEntity>>>;
  let mockDataSource: jest.Mocked<Partial<DataSource>>;

  const mockSkillCategory: SkillCategoryEntity = {
    id: 1,
    name: "Backend",
    createdAt: new Date("2026-05-24T00:00:00.000Z"),
    updatedAt: null,
  };

  const mockSkill: SkillEntity = {
    id: 1,
    name: "TypeScript",
    categoryId: 1,
    createdAt: new Date("2026-05-24T00:00:00.000Z"),
    updatedAt: null,
    category: mockSkillCategory,
  };

  const mockSkill2: SkillEntity = {
    id: 2,
    name: "Node.js",
    categoryId: 1,
    createdAt: new Date("2026-05-24T00:00:00.000Z"),
    updatedAt: null,
    category: mockSkillCategory,
  };

  beforeEach(async () => {
    mockCategoryRepo = {
      find: jest.fn(),
    };

    mockSkillRepo = {
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
    };

    mockDataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsRepository,
        {
          provide: getRepositoryToken(SkillCategoryEntity),
          useValue: mockCategoryRepo,
        },
        {
          provide: getRepositoryToken(SkillEntity),
          useValue: mockSkillRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get(SkillsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAllCategories", () => {
    it("should return all skill categories", async () => {
      const categories = [mockSkillCategory];
      (mockCategoryRepo.find as jest.Mock).mockResolvedValue(categories);

      const result = await repository.findAllCategories();

      expect(mockCategoryRepo.find).toHaveBeenCalledWith();
      expect(result).toEqual(categories);
    });

    it("should return empty array when no categories exist", async () => {
      (mockCategoryRepo.find as jest.Mock).mockResolvedValue([]);

      const result = await repository.findAllCategories();

      expect(result).toEqual([]);
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database error");
      (mockCategoryRepo.find as jest.Mock).mockRejectedValue(error);

      await expect(repository.findAllCategories()).rejects.toThrow(error);
    });
  });

  describe("findSkillsByCategoryId", () => {
    it("should return all skills when categoryId is undefined", async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockSkill, mockSkill2]),
      } as unknown as SelectQueryBuilder<SkillEntity>;

      (mockSkillRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      const result = await repository.findSkillsByCategoryId();

      expect(mockSkillRepo.createQueryBuilder).toHaveBeenCalledWith("skill");
      expect(result).toEqual([mockSkill, mockSkill2]);
    });

    it("should return filtered skills when categoryId is provided", async () => {
      const categoryId = 1;
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockSkill, mockSkill2]),
      } as unknown as SelectQueryBuilder<SkillEntity>;

      (mockSkillRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      const result = await repository.findSkillsByCategoryId(categoryId);

      expect(mockSkillRepo.createQueryBuilder).toHaveBeenCalledWith("skill");
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "skill.categoryId = :categoryId",
        { categoryId },
      );
      expect(result).toEqual([mockSkill, mockSkill2]);
    });

    it("should handle categoryId = 0", async () => {
      const categoryId = 0;
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as unknown as SelectQueryBuilder<SkillEntity>;

      (mockSkillRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      const result = await repository.findSkillsByCategoryId(categoryId);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "skill.categoryId = :categoryId",
        { categoryId: 0 },
      );
      expect(result).toEqual([]);
    });

    it("should return empty array when no skills match the category", async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as unknown as SelectQueryBuilder<SkillEntity>;

      (mockSkillRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      const result = await repository.findSkillsByCategoryId(999);

      expect(result).toEqual([]);
    });

    it("should handle query builder errors", async () => {
      const error = new Error("Query error");
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(error),
      } as unknown as SelectQueryBuilder<SkillEntity>;

      (mockSkillRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      await expect(repository.findSkillsByCategoryId(1)).rejects.toThrow(error);
    });
  });

  describe("findSkillsByIds", () => {
    it("should return skills matching the provided IDs", async () => {
      const ids = [1, 2];
      (mockSkillRepo.find as jest.Mock).mockResolvedValue([mockSkill, mockSkill2]);

      const result = await repository.findSkillsByIds(ids);

      expect(mockSkillRepo.find).toHaveBeenCalledWith({
        where: { id: In(ids) },
      });
      expect(result).toEqual([mockSkill, mockSkill2]);
    });

    it("should return empty array when ids array is empty", async () => {
      const result = await repository.findSkillsByIds([]);

      expect(mockSkillRepo.find).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should handle single skill ID", async () => {
      const ids = [1];
      (mockSkillRepo.find as jest.Mock).mockResolvedValue([mockSkill]);

      const result = await repository.findSkillsByIds(ids);

      expect(mockSkillRepo.find).toHaveBeenCalledWith({
        where: { id: In(ids) },
      });
      expect(result).toEqual([mockSkill]);
    });

    it("should return partial results when some IDs don't match", async () => {
      const ids = [1, 999, 2];
      (mockSkillRepo.find as jest.Mock).mockResolvedValue([mockSkill, mockSkill2]);

      const result = await repository.findSkillsByIds(ids);

      expect(mockSkillRepo.find).toHaveBeenCalledWith({
        where: { id: In(ids) },
      });
      expect(result).toEqual([mockSkill, mockSkill2]);
    });

    it("should return empty array when no skills match any IDs", async () => {
      const ids = [999, 1000];
      (mockSkillRepo.find as jest.Mock).mockResolvedValue([]);

      const result = await repository.findSkillsByIds(ids);

      expect(result).toEqual([]);
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database error");
      (mockSkillRepo.find as jest.Mock).mockRejectedValue(error);

      await expect(repository.findSkillsByIds([1])).rejects.toThrow(error);
    });

    it("should handle large arrays of IDs", async () => {
      const ids = Array.from({ length: 100 }, (_, i) => i + 1);
      (mockSkillRepo.find as jest.Mock).mockResolvedValue([mockSkill]);

      const result = await repository.findSkillsByIds(ids);

      expect(mockSkillRepo.find).toHaveBeenCalledWith({
        where: { id: In(ids) },
      });
      expect(result).toEqual([mockSkill]);
    });
  });
});
