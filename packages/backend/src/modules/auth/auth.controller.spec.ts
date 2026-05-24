import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "@ems-portal/types";
import { AuthController } from "./auth.controller";
import { AuthService, AuthResult } from "./auth.service";
import { UserEntity } from "@/modules/user/entites/user.entity";

const REFRESH_COOKIE_NAME = "ems.refresh";

const buildReply = (): jest.Mocked<FastifyReply> =>
  ({
    setCookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  }) as unknown as jest.Mocked<FastifyReply>;

const buildRequest = (cookies: Record<string, string> = {}): FastifyRequest =>
  ({ cookies }) as unknown as FastifyRequest;

const buildAuthResult = (overrides: Partial<AuthResult> = {}): AuthResult => ({
  accessToken: "access-jwt",
  refreshToken: "raw-refresh",
  user: {
    id: "u1",
    email: "client@ems.local",
    name: "Test Client",
    role: UserRole.Client,
    createdAt: new Date("2026-05-24T00:00:00.000Z"),
    updatedAt: null,
  },
  ...overrides,
});

describe("AuthController", () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const configValues: Record<string, string> = {
      APP_JWT_SECRET: "test-secret",
      APP_REFRESH_COOKIE_NAME: REFRESH_COOKIE_NAME,
      APP_REFRESH_EXPIRES_IN: "7d",
      APP_REFRESH_COOKIE_SECURE: "false",
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
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

    controller = module.get(AuthController);
    service = module.get(AuthService);

    jest.clearAllMocks();
  });

  it("register: delegates to service and sets refresh cookie", async () => {
    const dto = {
      email: "client@ems.local",
      name: "Test Client",
      role: UserRole.Client,
      password: "supersecret",
    };
    const result = buildAuthResult();
    service.register.mockResolvedValue(result);

    const reply = buildReply();
    const response = await controller.register(dto, reply);

    expect(service.register).toHaveBeenCalledWith(dto);
    expect(response).toEqual({
      accessToken: result.accessToken,
      user: result.user,
    });
    expect(reply.setCookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      result.refreshToken,
      expect.objectContaining({ httpOnly: true, path: "/api/auth" }),
    );
  });

  it("login: delegates to service and sets refresh cookie", async () => {
    const dto = { email: "client@ems.local", password: "supersecret" };
    const result = buildAuthResult();
    service.login.mockResolvedValue(result);

    const reply = buildReply();
    const response = await controller.login(dto, reply);

    expect(service.login).toHaveBeenCalledWith(dto);
    expect(response).toEqual({
      accessToken: result.accessToken,
      user: result.user,
    });
    expect(reply.setCookie).toHaveBeenCalled();
  });

  it("refresh: rotates token and sets a new refresh cookie", async () => {
    const result = buildAuthResult({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    service.refresh.mockResolvedValue(result);

    const reply = buildReply();
    const req = buildRequest({ [REFRESH_COOKIE_NAME]: "old-refresh" });
    const response = await controller.refresh(req, reply);

    expect(service.refresh).toHaveBeenCalledWith("old-refresh");
    expect(response).toEqual({
      accessToken: "new-access",
      user: result.user,
    });
    expect(reply.setCookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      "new-refresh",
      expect.any(Object),
    );
  });

  it("refresh: 401 when the cookie is missing", async () => {
    const reply = buildReply();
    const req = buildRequest({});

    await expect(controller.refresh(req, reply)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(service.refresh).not.toHaveBeenCalled();
  });

  it("logout: revokes token and clears the cookie", async () => {
    const reply = buildReply();
    const req = buildRequest({ [REFRESH_COOKIE_NAME]: "raw-refresh" });

    await controller.logout(req, reply);

    expect(service.logout).toHaveBeenCalledWith("raw-refresh");
    expect(reply.clearCookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      expect.objectContaining({ path: "/api/auth" }),
    );
  });

  it("logout: still clears cookie when none was sent", async () => {
    const reply = buildReply();
    const req = buildRequest({});

    await controller.logout(req, reply);

    expect(service.logout).not.toHaveBeenCalled();
    expect(reply.clearCookie).toHaveBeenCalled();
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
