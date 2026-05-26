import type {
  ProviderProfile,
  ProviderSkill,
  Skill,
  SkillCategory,
} from "@ems-portal/types";

export const fakeProviderProfile = (
  overrides: Partial<ProviderProfile> = {},
): ProviderProfile => ({
  id: "profile_1",
  userId: "user_1",
  bio: "Experienced engineer with 10+ years in distributed systems.",
  latitude: 52.52,
  longitude: 13.405,
  isAvailable: true,
  hourlyRateMin: 80,
  hourlyRateMax: 150,
  ratingAverage: 4.7,
  ratingCount: 12,
  completedEngagementsCount: 15,
  verificationStatus: "verified",
  verifiedAt: new Date("2026-04-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-05-01T00:00:00.000Z"),
  skills: [],
  ...overrides,
});

export const fakeProviderSkill = (
  overrides: Partial<ProviderSkill> = {},
): ProviderSkill => ({
  skillId: 1,
  level: "mid",
  yearsOfExperience: 5,
  createdAt: new Date("2026-02-01T00:00:00.000Z"),
  ...overrides,
});

export const fakeSkillCategories: SkillCategory[] = [
  { id: 1, name: "Network" },
  { id: 2, name: "Software" },
];

export const fakeSkills: Skill[] = [
  { id: 1, name: "TCP/IP", categoryId: 1 },
  { id: 2, name: "Cisco Routing", categoryId: 1 },
  { id: 3, name: "TypeScript", categoryId: 2 },
  { id: 4, name: "PostgreSQL", categoryId: 2 },
];
