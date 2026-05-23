import { z } from "zod";

export const MetricMemoryUsageSchema = z.object({
  rss: z.number().int().nonnegative(),
  heapTotal: z.number().int().nonnegative(),
  heapUsed: z.number().int().nonnegative(),
  external: z.number().int().nonnegative(),
});

export type MetricMemoryUsage = z.infer<typeof MetricMemoryUsageSchema>;

export const MetricProcessSchema = z.object({
  pid: z.number().int().nonnegative(),
  memoryUsage: MetricMemoryUsageSchema,
});

export type MetricProcess = z.infer<typeof MetricProcessSchema>;

export const MetricAppSchema = z.object({
  environment: z.string(),
  startTime: z.string().datetime(),
});

export type MetricApp = z.infer<typeof MetricAppSchema>;

export const MetricSchema = z.object({
  timestamp: z.string().datetime(),
  uptimeSeconds: z.number().int().nonnegative(),
  app: MetricAppSchema,
  process: MetricProcessSchema,
});

export type Metric = z.infer<typeof MetricSchema>;
