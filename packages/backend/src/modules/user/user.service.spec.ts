import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { UserRole } from "@ems-portal/types";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { UserEntity } from "./entites/user.entity";

jest.mock("bcrypt");

describe("UserService", () => {
  let service: UserService;
  let repositoryMock: jest.Mocked<UserRepository>;

  const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity => {
    const user = new UserEntity();
    user.id = "user_1";
    user.email = "client@ems.local";
    user.name = "Test Client";
    user.role = UserRole.Client;
    user.passwordHash = "hashed";
    user.createdAt = new Date("2026-05-24T00:00:00.000Z");
    user.updatedAt = null;
    Object.assign(user, overrides);
    return user;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            findOneOrFail: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UserService);
    repositoryMock = module.get(UserRepository);

    jest.clearAllMocks();
  });

  it("findByEmail: delegates to repository.findByEmail", async () => {
    const user = makeUser();
    repositoryMock.findByEmail.mockResolvedValue(user);

    await expect(service.findByEmail("client@ems.local")).resolves.toBe(user);
    expect(repositoryMock.findByEmail).toHaveBeenCalledWith("client@ems.local");
  });

  it("findById: delegates to repository.findOneOrFail", async () => {
    const user = makeUser({ id: "user_42" });
    repositoryMock.findOneOrFail.mockResolvedValue(user);

    await expect(service.findById("user_42")).resolves.toBe(user);
    expect(repositoryMock.findOneOrFail).toHaveBeenCalledWith({
      where: { id: "user_42" },
    });
  });

  it("createUser: hashes password and lowercases email before saving", async () => {
    const hashed = "hashed-pw";
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashed);
    const saved = makeUser();
    repositoryMock.save.mockResolvedValue(saved);

    await service.createUser({
      email: "Client@EMS.local",
      name: "Test Client",
      role: UserRole.Client,
      password: "supersecret",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("supersecret", 10);
    expect(repositoryMock.save).toHaveBeenCalledWith({
      email: "client@ems.local",
      name: "Test Client",
      role: UserRole.Client,
      passwordHash: hashed,
    });
  });

  it("verifyPassword: delegates to bcrypt.compare", async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(service.verifyPassword("pw", "hash")).resolves.toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith("pw", "hash");
  });
});
