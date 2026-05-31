import * as path from "path";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRole } from "@ems-portal/types";
import { databaseConfig } from "@/config/database";
import { jwtModuleConfig } from "@/config/auth";
import { AuthService } from "./auth.service";
import { UserService } from "@/modules/user/user.service";
import { UserRepository } from "@/modules/user/user.repository";
import { UserEntity } from "@/modules/user/entites/user.entity";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { RefreshTokenRepository } from "./refresh-token/refresh-token.repository";
import { RefreshTokenEntity } from "./refresh-token/entities/refresh-token.entity";
import { ProviderProfileRepository } from "@/modules/provider-profile/provider-profile.repository";
import { ProviderProfileEntity } from "@/modules/provider-profile/entities/provider-profile.entity";
import { ProviderSkillEntity } from "@/modules/provider-profile/entities/provider-skill.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { SkillCategoryEntity } from "@/modules/skills/entities/skill-category.entity";

/**
 * Integration tests for AuthService.
 * Hits the live Postgres database via TypeORM and the JwtModule.
 * Each test cleans up the rows it creates.
 */
describe("AuthService (Integration)", () => {
  let authService: AuthService;
  let userRepo: UserRepository;
  let providerProfileRepo: ProviderProfileRepository;
  let module: TestingModule;

  const TEST_EMAIL_PREFIX = "auth-int-test-";

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: [path.resolve(process.cwd(), "../../.env"), ".env"],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            ...databaseConfig(config),
            entities: [
              UserEntity,
              RefreshTokenEntity,
              ProviderProfileEntity,
              ProviderSkillEntity,
              SkillEntity,
              SkillCategoryEntity,
            ],
            synchronize: false,
            dropSchema: false,
          }),
        }),
        TypeOrmModule.forFeature([
          UserEntity,
          RefreshTokenEntity,
          ProviderProfileEntity,
          ProviderSkillEntity,
          SkillEntity,
          SkillCategoryEntity,
        ]),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: jwtModuleConfig,
        }),
      ],
      providers: [
        AuthService,
        UserService,
        UserRepository,
        RefreshTokenService,
        RefreshTokenRepository,
        ProviderProfileRepository,
      ],
    }).compile();

    authService = module.get(AuthService);
    userRepo = module.get(UserRepository);
    providerProfileRepo = module.get(ProviderProfileRepository);
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    // Delete provider profiles first (ON DELETE RESTRICT prevents removing users first).
    const testUsers = await userRepo.find({
      where: {},
      select: ["id", "email"],
    });
    const testUserIds = testUsers
      .filter((u) => u.email.startsWith(TEST_EMAIL_PREFIX))
      .map((u) => u.id);
    if (testUserIds.length > 0) {
      await providerProfileRepo
        .createQueryBuilder()
        .delete()
        .where("user_id IN (:...ids)", { ids: testUserIds })
        .execute();
    }
    await userRepo
      .createQueryBuilder()
      .delete()
      .where("email LIKE :pattern", { pattern: `${TEST_EMAIL_PREFIX}%` })
      .execute();
  });

  const newEmail = (suffix: string): string =>
    `${TEST_EMAIL_PREFIX}${suffix}-${Date.now()}@ems.local`;

  it("register: creates a user, returns access token and public profile", async () => {
    const email = newEmail("happy");

    const result = await authService.register({
      email,
      name: "Integration Client",
      role: UserRole.Client,
      password: "supersecret",
    });

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.accessToken.length).toBeGreaterThan(20);
    expect(result.user).toMatchObject({
      email,
      name: "Integration Client",
      role: UserRole.Client,
    });
    expect(
      result.user as unknown as Record<string, unknown>,
    ).not.toHaveProperty("passwordHash");
  });

  it("register: rejects duplicate email with ConflictException", async () => {
    const email = newEmail("dup");

    await authService.register({
      email,
      name: "First",
      role: UserRole.Client,
      password: "supersecret",
    });

    await expect(
      authService.register({
        email,
        name: "Second",
        role: UserRole.ServiceProvider,
        password: "anotherpw",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("login: returns a token after a successful register/login round-trip", async () => {
    const email = newEmail("roundtrip");
    const password = "round-trip-pw";

    await authService.register({
      email,
      name: "Round Trip",
      role: UserRole.ServiceProvider,
      password,
    });

    const loginResult = await authService.login({ email, password });

    expect(loginResult.accessToken).toEqual(expect.any(String));
    expect(loginResult.user.email).toBe(email);
    expect(loginResult.user.role).toBe(UserRole.ServiceProvider);
  });

  it("login: throws UnauthorizedException for wrong password", async () => {
    const email = newEmail("wrongpw");

    await authService.register({
      email,
      name: "Wrong PW",
      role: UserRole.Client,
      password: "correct-pw",
    });

    await expect(
      authService.login({ email, password: "wrong-pw" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("login: throws UnauthorizedException for unknown email", async () => {
    await expect(
      authService.login({
        email: `${TEST_EMAIL_PREFIX}does-not-exist@ems.local`,
        password: "whatever",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
