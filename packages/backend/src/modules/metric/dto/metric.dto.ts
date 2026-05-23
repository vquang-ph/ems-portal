import { createZodDto } from "nestjs-zod";
import { MetricSchema } from "../schema/metric.schema";

export class MetricDto extends createZodDto(MetricSchema) {}
