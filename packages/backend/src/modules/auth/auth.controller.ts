import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthConfig, authConfig, expiresInToMs } from "@/config/auth";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  UserDto,
} from "./dto/auth.dto";
import { Public } from "./decorators/public.decorator";
import type { UserEntity } from "@/modules/user/entities/user.entity";
import { AuthResult } from "./interfaces/auth.interface";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  private readonly authCfg: AuthConfig;

  public constructor(
    private readonly service: AuthService,
    configService: ConfigService,
  ) {
    this.authCfg = authConfig(configService);
  }

  /**
   * Registers a new Client or Service Provider and issues both tokens.
   * The refresh token is set as an httpOnly cookie; the body returns the
   * access token and public user.
   */
  @Post("register")
  @Public()
  @ApiOperation({ summary: "Register a new Client or Service Provider" })
  public async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponseDto> {
    const result = await this.service.register(dto);
    this.setRefreshCookie(reply, result.refreshToken);
    return this.toAuthResponse(result);
  }

  /**
   * Verifies credentials and issues both tokens.
   * Refresh in httpOnly cookie; access token + user in the body.
   */
  @Post("login")
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: "Log in with email + password" })
  public async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponseDto> {
    const result = await this.service.login(dto);
    this.setRefreshCookie(reply, result.refreshToken);
    return this.toAuthResponse(result);
  }

  /**
   * Rotates the refresh token and issues a new access token. The previous
   * refresh token is consumed; replays of revoked tokens trigger
   * family-wide revocation as a theft signal.
   *
   * @throws UnauthorizedException when the cookie is missing, expired,
   *         or refers to a revoked token.
   */
  @Post("refresh")
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: "Rotate the refresh token and issue a new access token",
  })
  public async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponseDto> {
    const rawToken = req.cookies?.[this.authCfg.refreshCookieName];

    if (!rawToken) {
      throw new UnauthorizedException("Missing refresh token");
    }

    const result = await this.service.refresh(rawToken);
    this.setRefreshCookie(reply, result.refreshToken);
    return this.toAuthResponse(result);
  }

  /**
   * Revokes the current refresh token server-side and clears the cookie.
   * Always returns 204, even if the cookie is missing or already revoked.
   */
  @Post("logout")
  @Public()
  @HttpCode(204)
  @ApiOperation({ summary: "Revoke the refresh token and clear the cookie" })
  public async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<void> {
    const rawToken = req.cookies?.[this.authCfg.refreshCookieName];
    if (rawToken) {
      await this.service.logout(rawToken);
    }
    this.clearRefreshCookie(reply);
  }

  /**
   * Returns the currently authenticated user. Requires a valid access token.
   */
  @Get("me")
  @ApiOperation({ summary: "Get the currently authenticated user" })
  public me(@CurrentUser() user: UserEntity): UserDto {
    return AuthService.toPublicUser(user);
  }

  /**
   * Writes the refresh token to an httpOnly cookie scoped to /api/auth.
   *
   * @param reply - The Fastify reply being built.
   * @param rawToken - The raw refresh token to set.
   */
  private setRefreshCookie(reply: FastifyReply, rawToken: string): void {
    reply.setCookie(this.authCfg.refreshCookieName, rawToken, {
      httpOnly: true,
      secure: this.authCfg.refreshCookieSecure,
      sameSite: "lax",
      path: "/api/auth",
      maxAge: Math.floor(
        expiresInToMs(this.authCfg.refreshTokenExpiresIn) / 1000,
      ),
      domain: this.authCfg.refreshCookieDomain,
    });
  }

  /**
   * Clears the refresh cookie by setting it expired with the same scope.
   *
   * @param reply - The Fastify reply being built.
   */
  private clearRefreshCookie(reply: FastifyReply): void {
    reply.clearCookie(this.authCfg.refreshCookieName, {
      path: "/api/auth",
      domain: this.authCfg.refreshCookieDomain,
    });
  }

  /**
   * Drops the refresh token before returning the response body.
   *
   * @param result - The internal auth result with refresh token attached.
   * @returns The public auth response shape (no refresh token).
   */
  private toAuthResponse(result: AuthResult): AuthResponseDto {
    return { accessToken: result.accessToken, user: result.user };
  }
}
