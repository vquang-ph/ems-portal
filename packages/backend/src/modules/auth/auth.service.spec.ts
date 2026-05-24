import { ConflictException, UnauthorizedException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@ems-portal/types";
import { AuthService } from "./auth.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { RefreshTokenEntity } from "./refresh-token/entities/refresh-token.entity";
import { UserService } from "@/modules/user/user.service";
import { UserEntity } from "@/modules/user/entites/user.entity";
import type { RegisterDto, LoginDto } from "./dto/auth.dto";

describe("AuthService", () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;

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

  const makeRefreshRecord = (
    overrides: Partial<RefreshTokenEntity> = {},
  ): RefreshTokenEntity => {
    const record = new RefreshTokenEntity();
    record.id = "rt_1";
    record.userId = "user_1";
    record.familyId = "fam_1";
    record.tokenHash = "hash";
    record.expiresAt = new Date(Date.now() + 60_000);
    record.revokedAt = null;
    record.replacedByTokenId = null;
    record.createdAt = new Date();
    record.updatedAt = null;
    Object.assign(record, overrides);
    return record;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            createUser: jest.fn(),
            verifyPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("signed-token"),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            issueNewFamily: jest.fn().mockResolvedValue("raw-refresh"),
            validateAndConsume: jest.fn(),
            rotate: jest.fn().mockResolvedValue("rotated-refresh"),
            revokeOne: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    refreshTokenService = module.get(RefreshTokenService);

    jest.clearAllMocks();
    (refreshTokenService.issueNewFamily as jest.Mock).mockResolvedValue(
      "raw-refresh",
    );
    (refreshTokenService.rotate as jest.Mock).mockResolvedValue(
      "rotated-refresh",
    );
  });

  describe("register", () => {
    const dto: RegisterDto = {
      email: "client@ems.local",
      name: "Test Client",
      role: UserRole.Client,
      password: "supersecret",
    };

    it("creates user and returns access + refresh tokens with public user", async () => {
      userService.findByEmail.mockResolvedValue(null);
      const user = makeUser();
      userService.createUser.mockResolvedValue(user);

      const result = await service.register(dto);

      expect(userService.createUser).toHaveBeenCalledWith({
        email: dto.email,
        name: dto.name,
        role: dto.role,
        password: dto.password,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id });
      expect(refreshTokenService.issueNewFamily).toHaveBeenCalledWith(user.id);
      expect(result.accessToken).toBe("signed-token");
      expect(result.refreshToken).toBe("raw-refresh");
      expect(result.user).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      // never leak hash
      expect(
        result.user as unknown as Record<string, unknown>,
      ).not.toHaveProperty("passwordHash");
    });

    it("throws ConflictException when email already in use", async () => {
      userService.findByEmail.mockResolvedValue(makeUser());

      await expect(service.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(userService.createUser).not.toHaveBeenCalled();
      expect(refreshTokenService.issueNewFamily).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    const dto: LoginDto = {
      email: "client@ems.local",
      password: "supersecret",
    };

    it("returns access + refresh tokens when credentials are valid", async () => {
      const user = makeUser();
      userService.findByEmail.mockResolvedValue(user);
      userService.verifyPassword.mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result.accessToken).toBe("signed-token");
      expect(result.refreshToken).toBe("raw-refresh");
      expect(result.user.id).toBe(user.id);
      expect(refreshTokenService.issueNewFamily).toHaveBeenCalledWith(user.id);
    });

    it("throws UnauthorizedException when user not found", async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(refreshTokenService.issueNewFamily).not.toHaveBeenCalled();
    });

    it("throws UnauthorizedException when password mismatch", async () => {
      userService.findByEmail.mockResolvedValue(makeUser());
      userService.verifyPassword.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(refreshTokenService.issueNewFamily).not.toHaveBeenCalled();
    });
  });

  describe("refresh", () => {
    it("validates, rotates, and re-issues access token using fresh user data", async () => {
      const previous = makeRefreshRecord();
      refreshTokenService.validateAndConsume.mockResolvedValue(previous);
      const user = makeUser();
      userService.findById.mockResolvedValue(user);

      const result = await service.refresh("raw");

      expect(refreshTokenService.validateAndConsume).toHaveBeenCalledWith(
        "raw",
      );
      expect(userService.findById).toHaveBeenCalledWith(previous.userId);
      expect(refreshTokenService.rotate).toHaveBeenCalledWith(previous);
      expect(result.accessToken).toBe("signed-token");
      expect(result.refreshToken).toBe("rotated-refresh");
      expect(result.user.id).toBe(user.id);
    });

    it("throws UnauthorizedException when the underlying user is gone", async () => {
      refreshTokenService.validateAndConsume.mockResolvedValue(
        makeRefreshRecord(),
      );
      userService.findById.mockRejectedValue(new Error("not found"));

      await expect(service.refresh("raw")).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(refreshTokenService.rotate).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("delegates to refresh token service revokeOne", async () => {
      await service.logout("raw");
      expect(refreshTokenService.revokeOne).toHaveBeenCalledWith("raw");
    });
  });
});
