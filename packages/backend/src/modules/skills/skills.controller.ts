import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "@/modules/auth/decorators/public.decorator";
import { SkillCategoryDto, SkillDto } from "./dto/skills.dto";
import { SkillsService } from "./skills.service";

@ApiTags("Skills")
@Controller("skills")
export class SkillsController {
  public constructor(private readonly service: SkillsService) {}

  /**
   * Retrieves all skill categories.
   *
   * @returns Array of all skill categories.
   */
  @Get("categories")
  @Public()
  public async getCategories(): Promise<SkillCategoryDto[]> {
    return this.service.getCategories();
  }

  /**
   * Retrieves skills, optionally filtered by category.
   *
   * @param categoryId - Optional category ID to filter by.
   * @returns Array of matching skills.
   */
  @Get()
  @Public()
  public async getSkills(
    @Query("categoryId") categoryId?: number,
  ): Promise<SkillDto[]> {
    return this.service.getSkills(categoryId);
  }
}
