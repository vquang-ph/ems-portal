import { Injectable } from "@nestjs/common";
import { Metric, MetricApp, MetricProcess } from "./schema/metric.schema";

@Injectable()
export class MetricService {
  public constructor() {}

  public getMetrics(): Metric {
    return {
      timestamp: this.getTimeStamp(),
      uptimeSeconds: this.getUptimeSeconds(),
      app: this.getAppMetrics(),
      process: this.getProcessMetrics(),
    };
  }

  private getTimeStamp(): string {
    return new Date().toISOString();
  }

  private getUptimeSeconds(): number {
    return Math.floor(process.uptime());
  }

  private getAppMetrics(): MetricApp {
    return {
      environment: process.env.APP_ENVIRONMENT || "development",
      startTime: this.getProcesStartTime(),
    };
  }

  private getProcesStartTime(): string {
    const startTime = Date.now() - Math.floor(process.uptime() * 1000);
    return new Date(startTime).toISOString();
  }

  private getProcessMetrics(): MetricProcess {
    const memoryUsage = process.memoryUsage();

    return {
      pid: process.pid,
      memoryUsage: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
      },
    };
  }
}
