import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service";
import { HealthCheck, type HealthCheckResult } from "@nestjs/terminus";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  public constructor(private readonly service: HealthService) {}

  @Get()
  @HealthCheck()
  public async check(): Promise<HealthCheckResult> {
    return this.service.check();
  }
}
