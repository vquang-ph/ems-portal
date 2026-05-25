import { createZodDto } from "nestjs-zod";
import {
  AddProviderSkillSchema,
  CreateProviderProfileSchema,
  ProviderProfileSchema,
  UpdateProviderProfileSchema,
  type CreateProviderProfile,
} from "@ems-portal/types";

export class CreateProviderProfileDto extends createZodDto(
  CreateProviderProfileSchema,
) {}
export class UpdateProviderProfileDto extends createZodDto(
  UpdateProviderProfileSchema,
) {}
export class ProviderProfileDto extends createZodDto(ProviderProfileSchema) {}
export class AddProviderSkillDto extends createZodDto(AddProviderSkillSchema) {}

export type CreateProfileInput = CreateProviderProfile & { userId: string };
