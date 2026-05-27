import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import {
  type AddProviderSkill,
  type ProviderProfile,
  type ProviderSkill,
  type UpdateProviderProfile,
} from "@ems-portal/types";
import { SkillsService } from "@/modules/skills/skills.service";
import { CreateProfileInput } from "./dto/provider-profile.dto";
import {
  PROVIDER_PROFILE_REQUIRED_FIELDS,
  type ProviderProfileRequiredField,
} from "./provider-profile.constants";
import { ProviderProfileRepository } from "./provider-profile.repository";
import { ProviderProfileEntity } from "./entities/provider-profile.entity";
import { ProviderSkillEntity } from "./entities/provider-skill.entity";

@Injectable()
export class ProviderProfileService {
  private readonly logger = new Logger(ProviderProfileService.name);

  public constructor(
    @Inject() private readonly repository: ProviderProfileRepository,
    @Inject() private readonly skillsService: SkillsService,
  ) {}

  /**
   * Retrieves the authenticated user's own provider profile. A profile row is
   * eagerly created at registration for every service-provider user, so a
   * missing row here is an invariant violation rather than a business state.
   *
   * @param userId - The user's UUID.
   * @returns The provider profile with embedded skills.
   * @throws InternalServerErrorException if the invariant is violated.
   */
  public async getOwnProfile(userId: string): Promise<ProviderProfile> {
    const profile = await this.repository.findByUserId(userId);
    if (!profile) {
      this.logger.error(
        `Provider profile missing for user ${userId}. Expected to be eagerly created at registration.`,
      );
      throw new InternalServerErrorException(
        "Provider profile is missing for this account.",
      );
    }
    return this.mapToProfile(profile);
  }

  /**
   * Retrieves a provider's profile by user ID (public read endpoint).
   *
   * @param userId - The provider's user UUID.
   * @returns The provider profile with embedded skills.
   * @throws NotFoundException if no profile exists for the user.
   */
  public async getProfileByUserId(userId: string): Promise<ProviderProfile> {
    const profile = await this.repository.findByUserIdOrFail(userId);
    return this.mapToProfile(profile);
  }

  /**
   * Creates a new provider profile for the user.
   *
   * @param input - The profile data and user ID.
   * @returns The newly created provider profile.
   * @throws ConflictException if a profile already exists for the user.
   */
  public async createProfile(
    input: CreateProfileInput,
  ): Promise<ProviderProfile> {
    const existing = await this.repository.findByUserId(input.userId);
    if (existing) {
      throw new ConflictException(
        "Provider profile already exists for this user",
      );
    }

    const profile = await this.repository.save({
      userId: input.userId,
      bio: input.bio ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      isAvailable: input.isAvailable ?? true,
      hourlyRateMin: input.hourlyRateMin ?? null,
      hourlyRateMax: input.hourlyRateMax ?? null,
      verificationStatus: "unverified",
    });

    return this.mapToProfile(profile);
  }

  /**
   * Updates an existing provider profile.
   *
   * @param userId - The user's UUID.
   * @param dto - The fields to update.
   * @returns The updated provider profile.
   * @throws NotFoundException if no profile exists for the user.
   */
  public async updateProfile(
    userId: string,
    dto: UpdateProviderProfile,
  ): Promise<ProviderProfile> {
    const profile = await this.repository.findByUserIdOrFail(userId);

    // Apply updates
    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.latitude !== undefined) profile.latitude = dto.latitude;
    if (dto.longitude !== undefined) profile.longitude = dto.longitude;
    if (dto.isAvailable !== undefined) profile.isAvailable = dto.isAvailable;
    if (dto.hourlyRateMin !== undefined)
      profile.hourlyRateMin = dto.hourlyRateMin;
    if (dto.hourlyRateMax !== undefined)
      profile.hourlyRateMax = dto.hourlyRateMax;

    await this.repository.save(profile);
    return this.mapToProfile(profile);
  }

  /**
   * Adds a skill to the provider's profile, verifying the skill exists.
   *
   * @param userId - The user's UUID.
   * @param dto - The skill to add.
   * @returns The added provider skill.
   * @throws NotFoundException if no profile or skill exists.
   */
  public async addSkill(
    userId: string,
    dto: AddProviderSkill,
  ): Promise<ProviderSkill> {
    // Verify profile exists
    const profile = await this.repository.findByUserIdOrFail(userId);

    // Verify skill exists
    const skills = await this.skillsService.getSkillsByIds([dto.skillId]);
    if (skills.length === 0) {
      throw new NotFoundException(`Skill with ID ${dto.skillId} not found`);
    }

    // Add/update skill in profile
    const providerSkill = await this.repository.addSkill(profile.id, dto);

    return {
      skillId: providerSkill.skillId,
      level: providerSkill.level,
      yearsOfExperience: providerSkill.yearsOfExperience,
      createdAt: providerSkill.createdAt,
    };
  }

  /**
   * Removes a skill from the provider's profile.
   *
   * @param userId - The user's UUID.
   * @param skillId - The skill's ID to remove.
   * @throws NotFoundException if no profile exists for the user.
   */
  public async removeSkill(userId: string, skillId: number): Promise<void> {
    // Verify profile exists
    const profile = await this.repository.findByUserIdOrFail(userId);

    // Remove skill (idempotent — no error if absent)
    await this.repository.removeSkill(profile.id, skillId);
  }

  /**
   * Promotes the authenticated user's profile from `draft` to `active`,
   * making it eligible to appear in match results. Validates that every
   * required field is populated and that at least one skill is attached.
   * Republishing an already-active profile is a no-op (idempotent).
   *
   * @param userId - The user's UUID.
   * @returns The published provider profile.
   * @throws UnprocessableEntityException listing missing fields when the
   *         profile is not yet complete enough to publish.
   */
  public async publishOwnProfile(userId: string): Promise<ProviderProfile> {
    const profile = await this.repository.findByUserIdOrFail(userId);

    if (profile.profileStatus === "active") {
      return this.mapToProfile(profile);
    }

    const missing: ProviderProfileRequiredField[] =
      PROVIDER_PROFILE_REQUIRED_FIELDS.filter(
        (field) => profile[field] === null || profile[field] === undefined,
      );

    const hasSkill = (profile.providerSkills ?? []).length > 0;
    const reasons: string[] = [...missing];
    if (!hasSkill) reasons.push("skills");

    if (reasons.length > 0) {
      throw new UnprocessableEntityException({
        message: "Profile is not complete enough to publish.",
        missing: reasons,
      });
    }

    profile.profileStatus = "active";
    const saved = await this.repository.save(profile);
    return this.mapToProfile(saved);
  }

  /**
   * Maps a ProviderProfileEntity to the domain ProviderProfile type.
   */
  private mapToProfile(entity: ProviderProfileEntity): ProviderProfile {
    return {
      id: entity.id,
      userId: entity.userId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      bio: entity.bio,
      latitude: entity.latitude ? parseFloat(entity.latitude.toString()) : null,
      longitude: entity.longitude
        ? parseFloat(entity.longitude.toString())
        : null,
      isAvailable: entity.isAvailable,
      hourlyRateMin: entity.hourlyRateMin
        ? parseFloat(entity.hourlyRateMin.toString())
        : null,
      hourlyRateMax: entity.hourlyRateMax
        ? parseFloat(entity.hourlyRateMax.toString())
        : null,
      ratingAverage: parseFloat(entity.ratingAverage.toString()),
      ratingCount: entity.ratingCount,
      completedEngagementsCount: entity.completedEngagementsCount,
      verificationStatus: entity.verificationStatus,
      verifiedAt: entity.verifiedAt,
      profileStatus: entity.profileStatus,
      skills: entity.providerSkills?.map((ps: ProviderSkillEntity) => ({
        skillId: ps.skillId,
        level: ps.level,
        yearsOfExperience: ps.yearsOfExperience,
        createdAt: ps.createdAt,
      })),
    };
  }
}
