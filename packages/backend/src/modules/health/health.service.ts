import { Injectable } from "@nestjs/common";
import {
  HealthCheckService,
  HealthIndicatorFunction,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
  type HealthCheckResult,
} from "@nestjs/terminus";

@Injectable()
export class HealthService {
  public constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  public async check(): Promise<HealthCheckResult> {
    return this.health.check(this.getHealthIndicators());
  }

  public getHealthIndicators(): HealthIndicatorFunction[] {
    return [
      this.getDatabaseHealthIndicator(),
      this.getMemoryHealthIndicator(),
      this.getMemoryRSSHealthIndicator(),
    ];
  }

  private getDatabaseHealthIndicator(): HealthIndicatorFunction {
    return async () => this.db.pingCheck("database");
  }

  private getMemoryHealthIndicator(): HealthIndicatorFunction {
    return async () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024);
  }

  private getMemoryRSSHealthIndicator(): HealthIndicatorFunction {
    return async () => this.memory.checkRSS("memory_rss", 300 * 1024 * 1024);
  }
}
