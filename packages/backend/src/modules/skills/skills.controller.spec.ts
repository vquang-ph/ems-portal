import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import type { Skill, SkillCategory } from "@ems-portal/types";
import { SkillsController } from "./skills.controller";
import { SkillsService } from "./skills.service";

describe("SkillsController", () => {
  let controller: SkillsController;
  let service: jest.Mocked<SkillsService>;

  const mockSkillCategory: SkillCategory = {
    id: 1,
    name: "Backend",
    createdAt: new Date("2026-05-24T00:00:00.000Z"),
    updatedAt: null,
  };

  const mockSkill: Skill = {
    id: 1,
    name: "TypeScript",
    categoryId: 1,
    createdAt: new Date("2026-05-24T00:00:00.000Z"),
    updatedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        {
          provide: SkillsService,
          useValue: {
            getCategories: jest.fn(),
            getSkills: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(SkillsController);
    service = module.get(SkillsService);
  });

  describe("getCategories", () => {
    it("returns all skill categories", async () => {
      const categories = [mockSkillCategory];
      service.getCategories.mockResolvedValue(categories);

      const result = await controller.getCategories();

      expect(service.getCategories).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });

    it("returns empty array when no categories exist", async () => {
      service.getCategories.mockResolvedValue([]);

      const result = await controller.getCategories();

      expect(result).toEqual([]);
    });

    it("handles service errors gracefully", async () => {
      const error = new Error("Database error");
      service.getCategories.mockRejectedValue(error);

      await expect(controller.getCategories()).rejects.toThrow(error);
    });
  });

  describe("getSkills", () => {
    it("returns all skills when no category filter is provided", async () => {
      const skills = [mockSkill];
      service.getSkills.mockResolvedValue(skills);

      const result = await controller.getSkills();

      expect(service.getSkills).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(skills);
    });

    it("returns filtered skills when category ID is provided", async () => {
      const categoryId = 1;
      const filteredSkills = [mockSkill];
      service.getSkills.mockResolvedValue(filteredSkills);

      const result = await controller.getSkills(categoryId);

      expect(service.getSkills).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(filteredSkills);
    });

    it("returns empty array when skills don't exist in category", async () => {
      service.getSkills.mockResolvedValue([]);

      const result = await controller.getSkills(999);

      expect(result).toEqual([]);
    });

    it("handles service errors gracefully", async () => {
      const error = new Error("Database error");
      service.getSkills.mockRejectedValue(error);

      await expect(controller.getSkills()).rejects.toThrow(error);
    });
  });
});
