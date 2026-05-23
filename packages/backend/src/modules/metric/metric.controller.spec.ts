import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { MetricController } from "./metric.controller";
import { MetricService } from "./metric.service";
import type { MetricDto } from "./dto/metric.dto";

describe("MetricController", () => {
  let controller: MetricController;

  let service: MetricService;
  let serviceMock: jest.Mocked<MetricService>;

  const mockedMetric: MetricDto = {
    timestamp: "2025-01-01T00:00:00.000Z",
    uptimeSeconds: 123,
    app: {
      environment: "test",
      startTime: "2025-01-01T00:00:00.000Z",
    },
    process: {
      pid: 12345,
      memoryUsage: {
        rss: 1,
        heapTotal: 2,
        heapUsed: 3,
        external: 4,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricController],
      providers: [
        {
          provide: MetricService,
          useValue: {
            getMetrics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(MetricController);

    service = module.get(MetricService);
    serviceMock = service as jest.Mocked<MetricService>;

    jest.clearAllMocks();
  });

  it("constructor: can be instantiated directly", () => {
    const direct = new MetricController(service);
    expect(direct).toBeDefined();
  });

  it("getMetrics: returns MetricDto from service", () => {
    serviceMock.getMetrics.mockReturnValue(mockedMetric);

    const result = controller.getMetrics();

    expect(serviceMock.getMetrics).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockedMetric);
  });
});
