import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import { type AddProviderSkill } from "@ems-portal/types";
import { ProviderProfileEntity } from "./entities/provider-profile.entity";
import { ProviderSkillEntity } from "./entities/provider-skill.entity";

@Injectable()
export class ProviderProfileRepository extends Repository<ProviderProfileEntity> {
  public constructor(@InjectDataSource() private dataSource: DataSource) {
    super(ProviderProfileEntity, dataSource.createEntityManager());
  }

  /**
   * Inserts a stub provider profile (`draft` status, not available) for a
   * freshly created service-provider user. Intended to be called inside the
   * registration transaction so user + profile commit atomically.
   *
   * @param userId - The owning user's UUID.
   * @param manager - The active EntityManager from the enclosing transaction.
   * @returns The persisted stub profile entity.
   */
  public async createStub(
    userId: string,
    manager: EntityManager,
  ): Promise<ProviderProfileEntity> {
    return manager.getRepository(ProviderProfileEntity).save({
      userId,
      bio: null,
      latitude: null,
      longitude: null,
      isAvailable: false,
      hourlyRateMin: null,
      hourlyRateMax: null,
      ratingAverage: 0,
      ratingCount: 0,
      completedEngagementsCount: 0,
      verificationStatus: "unverified",
      verifiedAt: null,
      profileStatus: "draft",
    });
  }

  /**
   * Finds a provider profile by user ID, eager-loading skills.
   *
   * @param userId - The user's UUID.
   * @returns The matching provider profile or null if not found.
   */
  public async findByUserId(
    userId: string,
  ): Promise<ProviderProfileEntity | null> {
    return this.findOne({
      where: { userId },
      relations: ["providerSkills"],
    });
  }

  /**
   * Finds a provider profile by user ID, throwing if not found.
   *
   * @param userId - The user's UUID.
   * @returns The matching provider profile.
   * @throws EntityNotFoundError if no profile exists for the user.
   */
  public async findByUserIdOrFail(
    userId: string,
  ): Promise<ProviderProfileEntity> {
    return this.findOneOrFail({
      where: { userId },
      relations: ["providerSkills"],
    });
  }

  /**
   * Adds a skill to a provider's profile, upserting on composite key conflict.
   *
   * @param profileId - The provider profile's UUID.
   * @param dto - The skill to add.
   * @returns The created or updated provider skill.
   */
  public async addSkill(
    profileId: string,
    dto: AddProviderSkill,
  ): Promise<ProviderSkillEntity> {
    const skillRepo = this.dataSource.getRepository(ProviderSkillEntity);

    await skillRepo.upsert(
      {
        profileId,
        skillId: dto.skillId,
        level: dto.level,
        yearsOfExperience: dto.yearsOfExperience,
      },
      {
        conflictPaths: ["profileId", "skillId"],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    // Fetch the inserted/updated row
    const skill = await skillRepo.findOne({
      where: { profileId, skillId: dto.skillId },
    });

    return skill!;
  }

  /**
   * Removes a skill from a provider's profile.
   *
   * @param profileId - The provider profile's UUID.
   * @param skillId - The skill's ID.
   */
  public async removeSkill(profileId: string, skillId: number): Promise<void> {
    const skillRepo = this.dataSource.getRepository(ProviderSkillEntity);
    await skillRepo.delete({ profileId, skillId });
  }
}
