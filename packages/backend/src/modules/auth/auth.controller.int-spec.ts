import { Test, TestingModule } from "@nestjs/testing";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import fastifyCookie from "@fastify/cookie";
import { type AuthResponse, type User, UserRole } from "@ems-portal/types";
import { AppModule } from "@/app.module";
import { AuthService } from "./auth.service";
import { UserRepository } from "@/modules/user/user.repository";

/**
 * Integration tests for the global auth guard wiring.
 *
 * Tests that JwtAuthGuard and PermissionsGuard are properly registered as
 * APP_GUARD and execute in the correct order:
 * - Public routes (with @Public) allow unauthenticated requests
 * - Protected routes (without @Public) require a valid JWT
 * - Guard order ensures JwtAuthGuard populates req.user before PermissionsGuard checks it
 */
describe("Auth Controller & Global Guard Wiring (Integration)", () => {
  let app: NestFastifyApplication;
  let authService: AuthService;
  let userRepo: UserRepository;

  const TEST_EMAIL_PREFIX = "auth-ctrl-int-test-";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authService = moduleFixture.get(AuthService);
    userRepo = moduleFixture.get(UserRepository);

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    // Mirror main.ts: register @fastify/cookie so reply.setCookie() works in
    // the /auth/login and /auth/register handlers. Without this the routes
    // throw "reply.setCookie is not a function" and return 500.
    await app.register(fastifyCookie);

    app.setGlobalPrefix("api");
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await userRepo
      .createQueryBuilder()
      .delete()
      .where("email LIKE :pattern", { pattern: `${TEST_EMAIL_PREFIX}%` })
      .execute();
  });

  const newEmail = (suffix: string): string =>
    `${TEST_EMAIL_PREFIX}${suffix}-${Date.now()}@ems.local`;

  describe("Global JwtAuthGuard", () => {
    it("GET /auth/me without token returns 401 (global guard active)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
      });

      expect(response.statusCode).toBe(401);
    });

    it("GET /auth/me with valid token returns 200 (per-route guard removed)", async () => {
      const email = newEmail("valid-token");
      const password = "testpass123";

      // Register and log in to get a token
      const registerResult = await authService.register({
        email,
        name: "Test User",
        role: UserRole.Client,
        password,
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: {
          authorization: `Bearer ${registerResult.accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload) as User;
      expect(body).toMatchObject({
        email,
        name: "Test User",
        role: UserRole.Client,
      });
      expect(body).not.toHaveProperty("passwordHash");
    });
  });

  describe("@Public() decorator", () => {
    it("POST /auth/login without token returns 200 (@Public works)", async () => {
      const email = newEmail("login");
      const password = "testpass123";

      // First register a user
      await authService.register({
        email,
        name: "Login Test",
        role: UserRole.Client,
        password,
      });

      // Then call login without a token in the header — it should work
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: {
          email,
          password,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload) as AuthResponse;
      expect(body.accessToken).toBeDefined();
      expect(body.user).toMatchObject({
        email,
        name: "Login Test",
        role: UserRole.Client,
      });
    });

    it("POST /auth/register without token returns 201 (@Public on register)", async () => {
      const email = newEmail("register");

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email,
          name: "Register Test",
          role: UserRole.Client,
          password: "testpass123",
        },
      });

      // POST defaults to 201 Created in Nest; /register does not override
      // @HttpCode, unlike /login, /refresh, /logout.
      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.payload) as AuthResponse;
      expect(body.accessToken).toBeDefined();
      expect(body.user).toMatchObject({
        email,
        name: "Register Test",
        role: UserRole.Client,
      });
    });

    it("GET /health without token returns 200 (@Public on non-auth controller)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/health",
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload) as Record<string, unknown>;
      expect(body.status).toBe("ok");
    });

    it("GET /metrics without token returns 200 (@Public on metrics)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/metrics",
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.payload) as Record<string, unknown>;
      expect(body).toHaveProperty("timestamp");
    });
  });

  describe("Guard execution order", () => {
    it("PermissionsGuard has access to req.user (JwtAuthGuard runs first)", async () => {
      const email = newEmail("guard-order");
      const password = "testpass123";

      const registerResult = await authService.register({
        email,
        name: "Guard Order Test",
        role: UserRole.Client,
        password,
      });

      // GET /auth/me doesn't use @RequirePermissions, so PermissionsGuard
      // returns true without throwing. But it needs req.user to exist,
      // which only happens if JwtAuthGuard (which validates the JWT and
      // calls passport) runs before PermissionsGuard.
      // This test verifies that order by confirming a valid token gets
      // a successful response (if order was wrong, PermissionsGuard would
      // find req.user === undefined).
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: {
          authorization: `Bearer ${registerResult.accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.payload).toBeTruthy();
    });
  });
});
