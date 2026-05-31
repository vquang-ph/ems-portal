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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { type ProviderSkill, Permissions } from "@ems-portal/types";
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
@ApiBearerAuth()
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
  @RequirePermissions(Permissions.ProviderProfileCreateOwn)
  @HttpCode(201)
  @ApiOperation({ summary: "Create a new provider profile" })
  @ApiBody({ type: CreateProviderProfileDto })
  @ApiResponse({
    status: 201,
    description: "Provider profile successfully created",
    type: ProviderProfileDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 400, description: "Bad request" })
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
  @ApiOperation({ summary: "Get the authenticated user's provider profile" })
  @ApiResponse({
    status: 200,
    description: "Provider profile retrieved successfully",
    type: ProviderProfileDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Profile not found" })
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
  @RequirePermissions(Permissions.ProviderProfileUpdateOwn)
  @ApiOperation({ summary: "Update the authenticated user's provider profile" })
  @ApiBody({ type: UpdateProviderProfileDto })
  @ApiResponse({
    status: 200,
    description: "Provider profile successfully updated",
    type: ProviderProfileDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Profile not found" })
  public async updateMe(
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateProviderProfileDto,
  ): Promise<ProviderProfileDto> {
    return this.service.updateProfile(user.id, dto);
  }

  /**
   * Promotes the authenticated user's profile from `draft` to `active`,
   * making them eligible for matching. Idempotent for already-active
   * profiles; returns 422 with a list of missing fields otherwise.
   *
   * @param user - The authenticated user.
   * @returns The published provider profile.
   */
  @Patch("me/publish")
  @RequirePermissions(Permissions.ProviderProfileUpdateOwn)
  @HttpCode(200)
  @ApiOperation({
    summary: "Publish the authenticated user's profile to active status",
  })
  @ApiResponse({
    status: 200,
    description: "Profile successfully published to active",
    type: ProviderProfileDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({
    status: 422,
    description: "Profile validation failed; missing required fields",
  })
  @ApiResponse({ status: 404, description: "Profile not found" })
  public async publishMe(
    @CurrentUser() user: UserEntity,
  ): Promise<ProviderProfileDto> {
    return this.service.publishOwnProfile(user.id);
  }

  /**
   * Retrieves a provider's profile by user ID.
   *
   * @param userId - The provider's user UUID.
   * @returns The provider's profile.
   */
  @Get(":userId")
  @RequirePermissions(Permissions.ProviderProfileReadAny)
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
  @RequirePermissions(Permissions.ProviderProfileUpdateOwn)
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
  @RequirePermissions(Permissions.ProviderProfileUpdateOwn)
  @HttpCode(204)
  public async removeSkill(
    @CurrentUser() user: UserEntity,
    @Param("skillId", ParseIntPipe) skillId: number,
  ): Promise<void> {
    return this.service.removeSkill(user.id, skillId);
  }
}
