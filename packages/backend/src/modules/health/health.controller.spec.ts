import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import type { HealthCheckResult } from "@nestjs/terminus";

describe("HealthController", () => {
  let controller: HealthController;

  let service: HealthService;
  let serviceMock: jest.Mocked<HealthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(HealthController);

    service = module.get(HealthService);
    serviceMock = service as jest.Mocked<HealthService>;

    jest.clearAllMocks();
  });

  it("constructor: can be instantiated directly", () => {
    const direct = new HealthController(service);
    expect(direct).toBeDefined();
  });

  it("check: delegates to HealthService.check and returns result", async () => {
    const mockedResult: HealthCheckResult = {
      status: "ok",
      info: {},
      error: {},
      details: {},
    };

    serviceMock.check.mockResolvedValue(mockedResult);

    await expect(controller.check()).resolves.toEqual(mockedResult);

    expect(serviceMock.check).toHaveBeenCalledTimes(1);
  });
});
