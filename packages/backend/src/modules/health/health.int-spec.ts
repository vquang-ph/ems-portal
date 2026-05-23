import { Test, TestingModule } from "@nestjs/testing";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "@/app.module";
import { HealthCheckResult, MemoryHealthIndicator } from "@nestjs/terminus";

describe("Health & Readiness (Integration)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // For this test, we override the MemoryHealthIndicator to simulate different memory limits. Since Jest can consume more than usual memory, we set higher limits here.
      .overrideProvider(MemoryHealthIndicator)
      .useValue({
        checkHeap: (key: string, _ignoredLimit: number) => {
          const limit = 600 * 1024 * 1024;

          const used = process.memoryUsage().heapUsed;
          const isUp = used < limit;

          if (!isUp) {
            throw new Error(`Heap used (${used}) exceeded limit (${limit})`);
          }

          return {
            [key]: {
              status: "up",
            },
          };
        },
        checkRSS: (key: string, _ignoredLimit: number) => {
          const limit = 600 * 1024 * 1024;
          const used = process.memoryUsage().rss;
          const isUp = used < limit;

          if (!isUp) {
            throw new Error(`RSS used (${used}) exceeded limit (${limit})`);
          }

          return {
            [key]: {
              status: "up",
            },
          };
        },
      })
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.setGlobalPrefix("api");

    await app.init();

    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("Should return 200 OK (Readiness)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/health",
    });

    const body = JSON.parse(response.payload) as HealthCheckResult;

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.info?.database?.status).toBe("up");
  });
});
