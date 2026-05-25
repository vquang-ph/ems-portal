import { SkillCategoryEntity } from "@/modules/skills/entities/skill-category.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import type { Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { SKILL_CATEGORIES, SKILLS_BY_CATEGORY } from "./data/skill.data";

export const run = async (
  dataSource: DataSource,
  seedLogger: Logger,
): Promise<void> => {
  const categoryRepo = dataSource.getRepository(SkillCategoryEntity);
  const skillRepo = dataSource.getRepository(SkillEntity);

  seedLogger.log("Seeding 2-Skills...");

  // Upsert skill categories
  for (const categoryName of SKILL_CATEGORIES) {
    await categoryRepo.upsert(
      { name: categoryName },
      { conflictPaths: ["name"], skipUpdateIfNoValuesChanged: true },
    );
  }

  seedLogger.log(`Seeded ${SKILL_CATEGORIES.length} skill categories.`);

  // Upsert skills for each category
  let skillCount = 0;
  for (const [categoryName, skillNames] of Object.entries(SKILLS_BY_CATEGORY)) {
    const category = await categoryRepo.findOne({
      where: { name: categoryName },
    });
    if (!category) {
      throw new Error(`Skill category "${categoryName}" not found`);
    }

    for (const skillName of skillNames) {
      await skillRepo.upsert(
        { name: skillName, categoryId: category.id },
        {
          conflictPaths: ["name"],
          skipUpdateIfNoValuesChanged: true,
        },
      );
      skillCount++;
    }
  }

  seedLogger.log(`Done. ${skillCount} skills seeded.`);
};
