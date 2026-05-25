import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ProviderProfileRepository } from "./provider-profile.repository";
import { ProviderProfileService } from "./provider-profile.service";
import { SkillsService } from "@/modules/skills/skills.service";

describe("ProviderProfileService", () => {
  let service: ProviderProfileService;
  let repository: ProviderProfileRepository;
  let skillsService: SkillsService;

  beforeEach(async () => {
    const mockRepository = {
      findByUserId: jest.fn(),
      findByUserIdOrFail: jest.fn(),
      save: jest.fn(),
      addSkill: jest.fn(),
      removeSkill: jest.fn(),
    };

    const mockSkillsService = {
      getSkillsByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderProfileService,
        {
          provide: ProviderProfileRepository,
          useValue: mockRepository,
        },
        {
          provide: SkillsService,
          useValue: mockSkillsService,
        },
      ],
    }).compile();

    service = module.get<ProviderProfileService>(ProviderProfileService);
    repository = module.get<ProviderProfileRepository>(
      ProviderProfileRepository,
    );
    skillsService = module.get<SkillsService>(SkillsService);
  });

  describe("createProfile", () => {
    it("should create a new provider profile", async () => {
      const input = {
        userId: "user-123",
        bio: "Test bio",
        isAvailable: true,
      };

      const savedProfile = {
        id: "profile-123",
        userId: "user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        bio: "Test bio",
        isAvailable: true,
        ratingAverage: 0,
        ratingCount: 0,
        completedEngagementsCount: 0,
        verificationStatus: "unverified",
        verifiedAt: null,
        latitude: null,
        longitude: null,
        hourlyRateMin: null,
        hourlyRateMax: null,
        providerSkills: [],
      };

      jest.spyOn(repository, "findByUserId").mockResolvedValue(null);
      jest.spyOn(repository, "save").mockResolvedValue(savedProfile);

      const result = await service.createProfile(input);

      expect(repository.findByUserId).toHaveBeenCalledWith("user-123");
      expect(repository.save).toHaveBeenCalled();
      expect(result.userId).toBe("user-123");
    });

    it("should throw ConflictException if profile already exists", async () => {
      const input = {
        userId: "user-123",
        bio: "Test bio",
      };

      jest
        .spyOn(repository, "findByUserId")
        .mockResolvedValue({ userId: "user-123" } as any);

      await expect(service.createProfile(input)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("getOwnProfile", () => {
    it("should throw NotFoundException when profile does not exist", async () => {
      jest
        .spyOn(repository, "findByUserIdOrFail")
        .mockRejectedValue(new Error("Not found"));

      await expect(service.getOwnProfile("user-123")).rejects.toThrow();
    });
  });

  describe("addSkill", () => {
    it("should verify skill existence before adding", async () => {
      const userId = "user-123";
      const dto = {
        skillId: 1,
        level: "senior" as const,
        yearsOfExperience: 5,
      };

      const profile = {
        id: "profile-123",
        userId,
        providerSkills: [],
      };

      jest
        .spyOn(repository, "findByUserIdOrFail")
        .mockResolvedValue(profile as any);
      jest
        .spyOn(skillsService, "getSkillsByIds")
        .mockResolvedValue([{ id: 1, name: "Node.js", categoryId: 1 }]);
      jest.spyOn(repository, "addSkill").mockResolvedValue({
        profileId: "profile-123",
        skillId: 1,
        level: "senior",
        yearsOfExperience: 5,
        createdAt: new Date(),
      } as any);

      await service.addSkill(userId, dto);

      expect(skillsService.getSkillsByIds).toHaveBeenCalledWith([1]);
      expect(repository.addSkill).toHaveBeenCalledWith("profile-123", dto);
    });

    it("should throw NotFoundException if skill does not exist", async () => {
      const userId = "user-123";
      const dto = {
        skillId: 999,
        level: "senior" as const,
        yearsOfExperience: 5,
      };

      const profile = {
        id: "profile-123",
        userId,
        providerSkills: [],
      };

      jest
        .spyOn(repository, "findByUserIdOrFail")
        .mockResolvedValue(profile as any);
      jest.spyOn(skillsService, "getSkillsByIds").mockResolvedValue([]);

      await expect(service.addSkill(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("removeSkill", () => {
    it("should remove skill idempotently", async () => {
      const userId = "user-123";
      const skillId = 1;

      const profile = {
        id: "profile-123",
        userId,
        providerSkills: [],
      };

      jest
        .spyOn(repository, "findByUserIdOrFail")
        .mockResolvedValue(profile as any);
      jest.spyOn(repository, "removeSkill").mockResolvedValue(undefined);

      await service.removeSkill(userId, skillId);

      expect(repository.removeSkill).toHaveBeenCalledWith(
        "profile-123",
        skillId,
      );
    });
  });
});
