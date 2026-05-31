import { Test, TestingModule } from "@nestjs/testing";
import { UserEntity } from "@/modules/user/entites/user.entity";
import { ProviderProfileController } from "./provider-profile.controller";
import { ProviderProfileService } from "./provider-profile.service";

describe("ProviderProfileController", () => {
  let controller: ProviderProfileController;
  let service: ProviderProfileService;

  const mockUser = {
    id: "user-123",
    email: "provider@example.com",
    role: "service_provider",
  } as UserEntity;

  beforeEach(async () => {
    const mockService = {
      createProfile: jest.fn(),
      getOwnProfile: jest.fn(),
      updateProfile: jest.fn(),
      getProfileByUserId: jest.fn(),
      addSkill: jest.fn(),
      removeSkill: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderProfileController],
      providers: [
        {
          provide: ProviderProfileService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProviderProfileController>(
      ProviderProfileController,
    );
    service = module.get<ProviderProfileService>(ProviderProfileService);
  });

  describe("create", () => {
    it("should create a provider profile", async () => {
      const dto = { bio: "Test bio", isAvailable: true };
      const expectedResult = {
        id: "profile-123",
        userId: mockUser.id,
        bio: "Test bio",
        isAvailable: true,
        ratingAverage: 0,
        ratingCount: 0,
        completedEngagementsCount: 0,
        verificationStatus: "unverified",
      };

      jest
        .spyOn(service, "createProfile")
        .mockResolvedValue(expectedResult as any);

      const result = await controller.create(mockUser, dto as any);

      expect(service.createProfile).toHaveBeenCalledWith({
        ...dto,
        userId: mockUser.id,
      });
      expect(result.userId).toBe(mockUser.id);
    });
  });

  describe("getMe", () => {
    it("should return authenticated user's profile", async () => {
      const expectedResult = {
        id: "profile-123",
        userId: mockUser.id,
        bio: "Test bio",
        isAvailable: true,
      };

      jest
        .spyOn(service, "getOwnProfile")
        .mockResolvedValue(expectedResult as any);

      const result = await controller.getMe(mockUser);

      expect(service.getOwnProfile).toHaveBeenCalledWith(mockUser.id);
      expect(result.id).toBe("profile-123");
    });
  });

  describe("addSkill", () => {
    it("should add a skill to user's profile", async () => {
      const dto = {
        skillId: 1,
        level: "senior" as const,
        yearsOfExperience: 5,
      };
      const expectedResult = {
        skillId: 1,
        level: "senior",
        yearsOfExperience: 5,
        createdAt: new Date(),
      };

      jest.spyOn(service, "addSkill").mockResolvedValue(expectedResult as any);

      const result = await controller.addSkill(mockUser, dto as any);

      expect(service.addSkill).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result.skillId).toBe(1);
    });
  });
});
