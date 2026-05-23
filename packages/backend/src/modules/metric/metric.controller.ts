import { Controller, Get } from "@nestjs/common";
import { MetricService } from "./metric.service";
import { ApiTags } from "@nestjs/swagger";
import { MetricDto } from "./dto/metric.dto";

@ApiTags("Metrics")
@Controller("metrics")
export class MetricController {
  public constructor(private readonly service: MetricService) {}

  @Get()
  public getMetrics(): MetricDto {
    return this.service.getMetrics();
  }
}
