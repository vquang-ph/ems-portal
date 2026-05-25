import { Injectable } from "@nestjs/common";
import { type Skill, type SkillCategory } from "@ems-portal/types";
import { SkillsRepository } from "./skills.repository";

@Injectable()
export class SkillsService {
  public constructor(private readonly repository: SkillsRepository) {}

  /**
   * Retrieves all skill categories.
   *
   * @returns Array of all skill categories.
   */
  public async getCategories(): Promise<SkillCategory[]> {
    return this.repository.findAllCategories();
  }

  /**
   * Retrieves skills, optionally filtered by category.
   *
   * @param categoryId - Optional category ID to filter by.
   * @returns Array of matching skills.
   */
  public async getSkills(categoryId?: number): Promise<Skill[]> {
    return this.repository.findSkillsByCategoryId(categoryId);
  }

  /**
   * Retrieves multiple skills by their IDs.
   *
   * @param ids - Array of skill IDs to look up.
   * @returns Array of matching skills.
   */
  public async getSkillsByIds(ids: number[]): Promise<Skill[]> {
    return this.repository.findSkillsByIds(ids);
  }
}
