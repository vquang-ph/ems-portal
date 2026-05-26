import { z } from "zod";
import { BaseSchema } from "../base.schema";

export const VERIFICATION_STATUS_VALUES = [
  "unverified",
  "pending",
  "verified",
] as const;
export const PROFICIENCY_LEVEL_VALUES = [
  "junior",
  "mid",
  "senior",
  "expert",
] as const;

export const VerificationStatusSchema = z.enum(VERIFICATION_STATUS_VALUES);
export const ProficiencyLevelSchema = z.enum(PROFICIENCY_LEVEL_VALUES);
export type ProficiencyLevel = z.infer<typeof ProficiencyLevelSchema>;

export const SkillCategorySchema = z.object({
  id: z.number().int(),
  name: z.string().max(50),
});
export type SkillCategory = z.infer<typeof SkillCategorySchema>;

export const SkillSchema = z.object({
  id: z.number().int(),
  name: z.string().max(100),
  categoryId: z.number().int(),
});
export type Skill = z.infer<typeof SkillSchema>;

export const ProviderSkillSchema = z.object({
  skillId: z.number().int(),
  level: ProficiencyLevelSchema,
  yearsOfExperience: z.number().int().min(0),
  createdAt: z.coerce.date(),
});
export type ProviderSkill = z.infer<typeof ProviderSkillSchema>;

export const ProviderProfileSchema = BaseSchema.extend({
  userId: z.string().uuid(),
  bio: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  isAvailable: z.boolean(),
  hourlyRateMin: z.number().nullable(),
  hourlyRateMax: z.number().nullable(),
  ratingAverage: z.number(),
  ratingCount: z.number().int(),
  completedEngagementsCount: z.number().int(),
  verificationStatus: VerificationStatusSchema,
  verifiedAt: z.coerce.date().nullable(),
  skills: z.array(ProviderSkillSchema).optional(),
});
export type ProviderProfile = z.infer<typeof ProviderProfileSchema>;

export const CreateProviderProfileSchema = z.object({
  bio: z.string().max(1000).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  isAvailable: z.boolean().optional(),
  hourlyRateMin: z.number().positive().nullable().optional(),
  hourlyRateMax: z.number().positive().nullable().optional(),
});
export type CreateProviderProfile = z.infer<typeof CreateProviderProfileSchema>;

export const UpdateProviderProfileSchema = CreateProviderProfileSchema;
export type UpdateProviderProfile = CreateProviderProfile;

export const AddProviderSkillSchema = z.object({
  skillId: z.number().int().positive(),
  level: ProficiencyLevelSchema,
  yearsOfExperience: z.number().int().min(0).default(0),
});
export type AddProviderSkill = z.infer<typeof AddProviderSkillSchema>;
