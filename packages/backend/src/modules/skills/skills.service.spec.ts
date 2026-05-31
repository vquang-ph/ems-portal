import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { Skill, SkillCategory } from "@ems-portal/types";
import { SkillsService } from "./skills.service";
import { SkillsRepository } from "./skills.repository";
import type { SkillEntity } from "./entities/skill.entity";

describe("SkillsService", () => {
  let service: SkillsService;
  let repository: jest.Mocked<SkillsRepository>;

  const mockSkillCategory: SkillCategory = {
    id: 1,
    name: "Backend",
  };

  const mockSkill: Skill = {
    id: 1,
    name: "TypeScript",
    categoryId: 1,
  };

  const mockSkill2: Skill = {
    id: 2,
    name: "Node.js",
    categoryId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: SkillsRepository,
          useValue: {
            findAllCategories: jest.fn(),
            findSkillsByCategoryId: jest.fn(),
            findSkillsByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(SkillsService);
    repository = module.get(SkillsRepository);
  });

  describe("getCategories", () => {
    it("retrieves all skill categories from repository", async () => {
      const categories = [mockSkillCategory];
      repository.findAllCategories.mockResolvedValue(categories);

      const result = await service.getCategories();

      expect(repository.findAllCategories).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });

    it("returns empty array when no categories exist", async () => {
      repository.findAllCategories.mockResolvedValue([]);

      const result = await service.getCategories();

      expect(result).toEqual([]);
    });

    it("handles repository errors", async () => {
      const error = new Error("Database error");
      repository.findAllCategories.mockRejectedValue(error);

      await expect(service.getCategories()).rejects.toThrow(error);
    });
  });

  describe("getSkills", () => {
    it("retrieves all skills when no category filter provided", async () => {
      const skills = [mockSkill, mockSkill2];
      repository.findSkillsByCategoryId.mockResolvedValue(
        skills as unknown as SkillEntity[],
      );

      const result = await service.getSkills();

      expect(repository.findSkillsByCategoryId).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(skills);
    });

    it("retrieves skills filtered by category ID", async () => {
      const categoryId = 1;
      const skills = [mockSkill, mockSkill2];
      repository.findSkillsByCategoryId.mockResolvedValue(
        skills as unknown as SkillEntity[],
      );

      const result = await service.getSkills(categoryId);

      expect(repository.findSkillsByCategoryId).toHaveBeenCalledWith(
        categoryId,
      );
      expect(result).toEqual(skills);
    });

    it("returns empty array when category has no skills", async () => {
      repository.findSkillsByCategoryId.mockResolvedValue([]);

      const result = await service.getSkills(999);

      expect(result).toEqual([]);
    });

    it("handles repository errors", async () => {
      const error = new Error("Database error");
      repository.findSkillsByCategoryId.mockRejectedValue(error);

      await expect(service.getSkills()).rejects.toThrow(error);
    });
  });

  describe("getSkillsByIds", () => {
    it("retrieves multiple skills by their IDs", async () => {
      const ids = [1, 2];
      const skills = [mockSkill, mockSkill2];
      repository.findSkillsByIds.mockResolvedValue(
        skills as unknown as SkillEntity[],
      );

      const result = await service.getSkillsByIds(ids);

      expect(repository.findSkillsByIds).toHaveBeenCalledWith(ids);
      expect(result).toEqual(skills);
    });

    it("returns empty array when IDs list is empty", async () => {
      repository.findSkillsByIds.mockResolvedValue([]);

      const result = await service.getSkillsByIds([]);

      expect(repository.findSkillsByIds).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it("returns partial results when some IDs don't match", async () => {
      const ids = [1, 999];
      const skills = [mockSkill];
      repository.findSkillsByIds.mockResolvedValue(
        skills as unknown as SkillEntity[],
      );

      const result = await service.getSkillsByIds(ids);

      expect(repository.findSkillsByIds).toHaveBeenCalledWith(ids);
      expect(result).toEqual(skills);
    });

    it("handles repository errors", async () => {
      const error = new Error("Database error");
      repository.findSkillsByIds.mockRejectedValue(error);

      await expect(service.getSkillsByIds([1])).rejects.toThrow(error);
    });
  });
});
