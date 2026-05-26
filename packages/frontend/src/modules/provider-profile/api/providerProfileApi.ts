import { apiClient } from "@/lib/apiClient";
import { parseObjectWithDates } from "@/utils/parseObjectWithDates";
import type {
  AddProviderSkill,
  CreateProviderProfile,
  ProviderProfile,
  ProviderSkill,
  Skill,
  SkillCategory,
  UpdateProviderProfile,
} from "@ems-portal/types";

const providerProfileApi = {
  async getMyProfile(): Promise<ProviderProfile> {
    const res = await apiClient.get<ProviderProfile>("/provider-profiles/me");
    return parseObjectWithDates<ProviderProfile>(res.data);
  },

  async createProfile(body: CreateProviderProfile): Promise<ProviderProfile> {
    const res = await apiClient.post<ProviderProfile>(
      "/provider-profiles",
      body,
    );
    return parseObjectWithDates<ProviderProfile>(res.data);
  },

  async updateMyProfile(body: UpdateProviderProfile): Promise<ProviderProfile> {
    const res = await apiClient.patch<ProviderProfile>(
      "/provider-profiles/me",
      body,
    );
    return parseObjectWithDates<ProviderProfile>(res.data);
  },

  async getProfileByUserId(userId: string): Promise<ProviderProfile> {
    const res = await apiClient.get<ProviderProfile>(
      `/provider-profiles/${userId}`,
    );
    return parseObjectWithDates<ProviderProfile>(res.data);
  },

  async getSkillCategories(): Promise<SkillCategory[]> {
    const res = await apiClient.get<SkillCategory[]>("/skills/categories");
    return res.data;
  },

  async getSkills(categoryId?: number): Promise<Skill[]> {
    const res = await apiClient.get<Skill[]>("/skills", {
      params: categoryId !== undefined ? { categoryId } : undefined,
    });
    return res.data;
  },

  async addSkill(body: AddProviderSkill): Promise<ProviderSkill> {
    const res = await apiClient.post<ProviderSkill>(
      "/provider-profiles/me/skills",
      body,
    );
    return parseObjectWithDates<ProviderSkill>(res.data);
  },

  async removeSkill(skillId: number): Promise<void> {
    await apiClient.delete(`/provider-profiles/me/skills/${skillId}`);
  },
} as const;

export default providerProfileApi;
