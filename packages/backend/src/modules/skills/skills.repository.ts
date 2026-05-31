import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { SkillCategoryEntity } from "./entities/skill-category.entity";
import { SkillEntity } from "./entities/skill.entity";

@Injectable()
export class SkillsRepository {
  public constructor(
    @InjectRepository(SkillCategoryEntity)
    private readonly categoryRepo: Repository<SkillCategoryEntity>,
    @InjectRepository(SkillEntity)
    private readonly skillRepo: Repository<SkillEntity>,
  ) {}

  /**
   * Retrieves all skill categories.
   *
   * @returns Array of all skill categories.
   */
  public async findAllCategories(): Promise<SkillCategoryEntity[]> {
    return this.categoryRepo.find();
  }

  /**
   * Retrieves skills, optionally filtered by category.
   *
   * @param categoryId - Optional category ID to filter by.
   * @returns Array of matching skills.
   */
  public async findSkillsByCategoryId(
    categoryId?: number,
  ): Promise<SkillEntity[]> {
    const query = this.skillRepo.createQueryBuilder("skill");
    if (categoryId !== undefined) {
      query.where("skill.categoryId = :categoryId", { categoryId });
    }
    return query.getMany();
  }

  /**
   * Retrieves multiple skills by their IDs.
   *
   * @param ids - Array of skill IDs to look up.
   * @returns Array of matching skills.
   */
  public async findSkillsByIds(ids: number[]): Promise<SkillEntity[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.skillRepo.find({ where: { id: In(ids) } });
  }
}
