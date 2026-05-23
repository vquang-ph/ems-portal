import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { HealthService } from "./health.service";
import {
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";

describe("HealthService", () => {
  let service: HealthService;

  let health: jest.Mocked<HealthCheckService>;
  let db: jest.Mocked<TypeOrmHealthIndicator>;
  let memory: jest.Mocked<MemoryHealthIndicator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn(),
            checkRSS: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(HealthService);

    health = module.get(HealthCheckService);
    db = module.get(TypeOrmHealthIndicator);
    memory = module.get(MemoryHealthIndicator);

    jest.clearAllMocks();
  });

  it("constructor: can be instantiated directly", () => {
    const direct = new HealthService(health, db, memory);
    expect(direct).toBeDefined();
  });

  it("getHealthIndicators: returns three indicator functions", () => {
    const indicators = service.getHealthIndicators();

    expect(indicators).toHaveLength(3);
    indicators.forEach((fn) => {
      expect(typeof fn).toBe("function");
    });
  });

  it("database health indicator: calls db.pingCheck with correct key", async () => {
    const indicators = service.getHealthIndicators();
    const dbIndicator = indicators[0];

    db.pingCheck.mockResolvedValue({ database: { status: "up" } });

    const result = await dbIndicator();

    expect(db.pingCheck).toHaveBeenCalledTimes(1);
    expect(db.pingCheck).toHaveBeenCalledWith("database");
    expect(result).toEqual({ database: { status: "up" } });
  });

  it("memory heap health indicator: calls memory.checkHeap with correct threshold", async () => {
    const indicators = service.getHealthIndicators();
    const heapIndicator = indicators[1];

    memory.checkHeap.mockResolvedValue({ memory_heap: { status: "up" } });

    const result = await heapIndicator();

    expect(memory.checkHeap).toHaveBeenCalledTimes(1);
    expect(memory.checkHeap).toHaveBeenCalledWith(
      "memory_heap",
      150 * 1024 * 1024,
    );
    expect(result).toEqual({ memory_heap: { status: "up" } });
  });

  it("memory RSS health indicator: calls memory.checkRSS with correct threshold", async () => {
    const indicators = service.getHealthIndicators();
    const rssIndicator = indicators[2];

    memory.checkRSS.mockResolvedValue({ memory_rss: { status: "up" } });

    const result = await rssIndicator();

    expect(memory.checkRSS).toHaveBeenCalledTimes(1);
    expect(memory.checkRSS).toHaveBeenCalledWith(
      "memory_rss",
      300 * 1024 * 1024,
    );
    expect(result).toEqual({ memory_rss: { status: "up" } });
  });

  it("check: delegates to HealthCheckService.check with indicators", async () => {
    const mockResult = { status: "ok" } as any;

    health.check.mockResolvedValue(mockResult);

    const result = await service.check();

    expect(health.check).toHaveBeenCalledTimes(1);

    const passedIndicators = health.check.mock.calls[0][0];
    expect(Array.isArray(passedIndicators)).toBe(true);
    expect(passedIndicators).toHaveLength(3);

    expect(result).toBe(mockResult);
  });
});
