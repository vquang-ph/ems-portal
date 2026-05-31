import { createZodDto } from "nestjs-zod";
import { SkillCategorySchema, SkillSchema } from "@ems-portal/types";

export class SkillCategoryDto extends createZodDto(SkillCategorySchema) {}
export class SkillDto extends createZodDto(SkillSchema) {}
