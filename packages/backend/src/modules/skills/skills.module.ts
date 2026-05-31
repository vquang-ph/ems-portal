import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SkillCategoryEntity } from "./entities/skill-category.entity";
import { SkillEntity } from "./entities/skill.entity";
import { SkillsController } from "./skills.controller";
import { SkillsRepository } from "./skills.repository";
import { SkillsService } from "./skills.service";

@Module({
  imports: [TypeOrmModule.forFeature([SkillCategoryEntity, SkillEntity])],
  providers: [SkillsRepository, SkillsService],
  controllers: [SkillsController],
  exports: [SkillsService],
})
export class SkillsModule {}
