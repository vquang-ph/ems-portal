import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SkillsModule } from "@/modules/skills/skills.module";
import { ProviderProfileEntity } from "./entities/provider-profile.entity";
import { ProviderSkillEntity } from "./entities/provider-skill.entity";
import { ProviderProfileController } from "./provider-profile.controller";
import { ProviderProfileRepository } from "./provider-profile.repository";
import { ProviderProfileService } from "./provider-profile.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderProfileEntity, ProviderSkillEntity]),
    SkillsModule,
  ],
  providers: [ProviderProfileRepository, ProviderProfileService],
  controllers: [ProviderProfileController],
  exports: [ProviderProfileRepository],
})
export class ProviderProfileModule {}
