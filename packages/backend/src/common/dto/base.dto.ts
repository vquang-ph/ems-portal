import { AffectedResponseSchema } from "@ems-portal/types";
import { createZodDto } from "nestjs-zod";

export class AffectedResponseDto extends createZodDto(AffectedResponseSchema) {}
