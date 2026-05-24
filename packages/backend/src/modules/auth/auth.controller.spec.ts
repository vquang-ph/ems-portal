import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { UserRole } from "@ems-portal/types";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserEntity } from "@/modules/user/entites/user.entity";

describe("AuthController", () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService);

    jest.clearAllMocks();
  });

  it("register: delegates to service.register", async () => {
    const dto = {
      email: "client@ems.local",
      name: "Test Client",
      role: UserRole.Client,
      password: "supersecret",
    };
    const response = {
      accessToken: "token",
      user: {
        id: "u1",
        email: dto.email,
        name: dto.name,
        role: dto.role,
        createdAt: new Date(),
        updatedAt: null,
      },
    };
    service.register.mockResolvedValue(response);

    await expect(controller.register(dto)).resolves.toEqual(response);
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it("login: delegates to service.login", async () => {
    const dto = { email: "client@ems.local", password: "supersecret" };
    const response = {
      accessToken: "token",
      user: {
        id: "u1",
        email: dto.email,
        name: "Test Client",
        role: UserRole.Client,
        createdAt: new Date(),
        updatedAt: null,
      },
    };
    service.login.mockResolvedValue(response);

    await expect(controller.login(dto)).resolves.toEqual(response);
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it("me: returns the request user as a public DTO", () => {
    const user = new UserEntity();
    user.id = "user_42";
    user.email = "admin@ems.local";
    user.name = "Admin";
    user.role = UserRole.Admin;
    user.passwordHash = "hash";
    user.createdAt = new Date("2026-05-24T00:00:00.000Z");
    user.updatedAt = null;

    expect(controller.me(user)).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });
});
