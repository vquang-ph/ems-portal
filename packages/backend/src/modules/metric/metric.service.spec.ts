import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { MetricService } from "./metric.service";

describe("MetricService", () => {
  let service: MetricService;

  const ORIGINAL_ENV = process.env;
  const mockedAppEnvironment = "test";

  beforeEach(async () => {
    process.env = { ...ORIGINAL_ENV };

    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricService],
    }).compile();

    service = module.get(MetricService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("constructor: can be instantiated directly", () => {
    const direct = new MetricService();
    expect(direct).toBeDefined();
  });

  it("getMetrics: returns a fully populated metrics object (stable with mocks)", () => {
    const nowMs = 1_700_000_000_000; // fixed epoch ms
    const uptimeSeconds = 123.9; // will be floored to 123

    const memory = {
      rss: 10,
      heapTotal: 20,
      heapUsed: 30,
      external: 40,
      arrayBuffers: 50, // ignored by service
    };

    jest.spyOn(Date, "now").mockReturnValue(nowMs);
    jest.spyOn(process, "uptime").mockReturnValue(uptimeSeconds);
    jest
      .spyOn(process, "memoryUsage")
      .mockReturnValue(memory as NodeJS.MemoryUsage);

    // timestamp uses new Date().toISOString(), so freeze "now"
    jest.useFakeTimers().setSystemTime(new Date(nowMs));

    process.env.APP_ENVIRONMENT = mockedAppEnvironment;

    const result = service.getMetrics();

    expect(result.timestamp).toBe(new Date(nowMs).toISOString());
    expect(result.uptimeSeconds).toBe(123);

    const expectedStartMs = nowMs - Math.floor(uptimeSeconds * 1000);
    expect(result.app).toEqual({
      environment: mockedAppEnvironment,
      startTime: new Date(expectedStartMs).toISOString(),
    });

    // pid: assert it matches the real process.pid
    expect(result.process).toEqual({
      pid: process.pid,
      memoryUsage: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external,
      },
    });
  });

  it("getMetrics: defaults environment to development when APP_ENVIRONMENT is not set", () => {
    delete process.env.APP_ENVIRONMENT;

    const nowMs = 1_700_000_000_000;
    jest.spyOn(Date, "now").mockReturnValue(nowMs);
    jest.useFakeTimers().setSystemTime(new Date(nowMs));

    jest.spyOn(process, "uptime").mockReturnValue(1);
    jest.spyOn(process, "memoryUsage").mockReturnValue({
      rss: 1,
      heapTotal: 2,
      heapUsed: 3,
      external: 4,
      arrayBuffers: 5,
    } as NodeJS.MemoryUsage);

    const result = service.getMetrics();

    expect(result.app.environment).toBe("development");
  });

  it("getMetrics: floors uptimeSeconds", () => {
    const nowMs = 1_700_000_000_000;
    jest.spyOn(Date, "now").mockReturnValue(nowMs);
    jest.useFakeTimers().setSystemTime(new Date(nowMs));

    jest.spyOn(process, "uptime").mockReturnValue(9.99);
    jest.spyOn(process, "memoryUsage").mockReturnValue({
      rss: 1,
      heapTotal: 2,
      heapUsed: 3,
      external: 4,
      arrayBuffers: 5,
    } as NodeJS.MemoryUsage);

    const result = service.getMetrics();

    expect(result.uptimeSeconds).toBe(9);
  });
});
