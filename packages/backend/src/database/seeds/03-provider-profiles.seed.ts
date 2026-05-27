import { ProviderProfileEntity } from "@/modules/provider-profile/entities/provider-profile.entity";
import { ProviderSkillEntity } from "@/modules/provider-profile/entities/provider-skill.entity";
import { SkillEntity } from "@/modules/skills/entities/skill.entity";
import { UserEntity } from "@/modules/user/entites/user.entity";
import type { Logger } from "@nestjs/common";
import { DataSource } from "typeorm";

export const run = async (
  dataSource: DataSource,
  seedLogger: Logger,
): Promise<void> => {
  const profileRepo = dataSource.getRepository(ProviderProfileEntity);
  const providerSkillRepo = dataSource.getRepository(ProviderSkillEntity);
  const userRepo = dataSource.getRepository(UserEntity);
  const skillRepo = dataSource.getRepository(SkillEntity);

  seedLogger.log("Seeding 3-Provider-Profiles...");

  // Find the provider@ems.local user
  const providerUser = await userRepo.findOne({
    where: { email: "provider@ems.local" },
  });
  if (!providerUser) {
    seedLogger.error("Provider user (provider@ems.local) not found");
    return;
  }

  // Upsert provider profile
  const _profile = await profileRepo.upsert(
    {
      userId: providerUser.id,
      bio: "Experienced full-stack engineer specializing in Node.js and cloud networking",
      latitude: 40.7128,
      longitude: -74.006,
      isAvailable: true,
      hourlyRateMin: 75,
      hourlyRateMax: 150,
      verificationStatus: "unverified",
      profileStatus: "active",
    },
    { conflictPaths: ["userId"], skipUpdateIfNoValuesChanged: true },
  );

  seedLogger.log(`Provider profile created/updated for ${providerUser.email}`);

  // Fetch the actual profile to get the ID
  const savedProfile = await profileRepo.findOne({
    where: { userId: providerUser.id },
  });
  if (!savedProfile) {
    throw new Error("Failed to fetch saved provider profile");
  }

  // Attach 3 sample skills
  const sampleSkills: Array<{
    name: string;
    level: "junior" | "mid" | "senior" | "expert";
    yearsOfExperience: number;
  }> = [
    { name: "Node.js", level: "senior", yearsOfExperience: 8 },
    { name: "TypeScript", level: "senior", yearsOfExperience: 6 },
    { name: "TCP/IP Fundamentals", level: "mid", yearsOfExperience: 5 },
  ];

  for (const sample of sampleSkills) {
    const skill = await skillRepo.findOne({ where: { name: sample.name } });
    if (!skill) {
      seedLogger.warn(`Skill "${sample.name}" not found, skipping`);
      continue;
    }

    await providerSkillRepo.upsert(
      {
        profileId: savedProfile.id,
        skillId: skill.id,
        level: sample.level,
        yearsOfExperience: sample.yearsOfExperience,
      },
      {
        conflictPaths: ["profileId", "skillId"],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }

  seedLogger.log(
    `Done. Provider profile seeded with ${sampleSkills.length} skills.`,
  );
};
