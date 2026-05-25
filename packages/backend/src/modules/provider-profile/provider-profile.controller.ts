import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { type ProviderSkill } from "@ems-portal/types";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { RequirePermissions } from "@/modules/auth/decorators/require-permissions.decorator";
import { UserEntity } from "@/modules/user/entites/user.entity";
import {
  AddProviderSkillDto,
  CreateProviderProfileDto,
  ProviderProfileDto,
  UpdateProviderProfileDto,
} from "./dto/provider-profile.dto";
import { ProviderProfileService } from "./provider-profile.service";

@ApiTags("Provider Profiles")
@Controller("provider-profiles")
export class ProviderProfileController {
  public constructor(private readonly service: ProviderProfileService) {}

  /**
   * Creates a new provider profile for the authenticated user.
   *
   * @param user - The authenticated user.
   * @param dto - The profile data.
   * @returns The created provider profile.
   */
  @Post()
  @RequirePermissions("provider_profile:create:own")
  @HttpCode(201)
  public async create(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateProviderProfileDto,
  ): Promise<ProviderProfileDto> {
    return this.service.createProfile({ ...dto, userId: user.id });
  }

  /**
   * Retrieves the authenticated user's own provider profile.
   *
   * @param user - The authenticated user.
   * @returns The user's provider profile.
   */
  @Get("me")
  @HttpCode(200)
  public async getMe(
    @CurrentUser() user: UserEntity,
  ): Promise<ProviderProfileDto> {
    return this.service.getOwnProfile(user.id);
  }

  /**
   * Updates the authenticated user's provider profile.
   *
   * @param user - The authenticated user.
   * @param dto - The fields to update.
   * @returns The updated provider profile.
   */
  @Patch("me")
  @RequirePermissions("provider_profile:update:own")
  public async updateMe(
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateProviderProfileDto,
  ): Promise<ProviderProfileDto> {
    return this.service.updateProfile(user.id, dto);
  }

  /**
   * Retrieves a provider's profile by user ID.
   *
   * @param userId - The provider's user UUID.
   * @returns The provider's profile.
   */
  @Get(":userId")
  @RequirePermissions("provider_profile:read:any")
  public async getByUserId(
    @Param("userId") userId: string,
  ): Promise<ProviderProfileDto> {
    return this.service.getProfileByUserId(userId);
  }

  /**
   * Adds a skill to the authenticated user's profile.
   *
   * @param user - The authenticated user.
   * @param dto - The skill to add.
   * @returns The added provider skill.
   */
  @Post("me/skills")
  @RequirePermissions("provider_profile:update:own")
  @HttpCode(201)
  public async addSkill(
    @CurrentUser() user: UserEntity,
    @Body() dto: AddProviderSkillDto,
  ): Promise<ProviderSkill> {
    return this.service.addSkill(user.id, dto);
  }

  /**
   * Removes a skill from the authenticated user's profile.
   *
   * @param user - The authenticated user.
   * @param skillId - The skill's ID to remove.
   */
  @Delete("me/skills/:skillId")
  @RequirePermissions("provider_profile:update:own")
  @HttpCode(204)
  public async removeSkill(
    @CurrentUser() user: UserEntity,
    @Param("skillId", ParseIntPipe) skillId: number,
  ): Promise<void> {
    return this.service.removeSkill(user.id, skillId);
  }
}
