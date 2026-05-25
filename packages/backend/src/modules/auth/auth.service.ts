import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { AuthResponse } from "@ems-portal/types";
import { UserService } from "@/modules/user/user.service";
import type { UserEntity } from "@/modules/user/entites/user.entity";
import type { LoginDto, RegisterDto } from "./dto/auth.dto";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import type { JwtPayload } from "./strategies/jwt.strategy";
import { AuthResult } from "./interfaces/auth.interface";

@Injectable()
export class AuthService {
  public constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  /**
   * Registers a new user and issues an access + refresh token pair.
   *
   * @param dto - Registration payload (email, name, role, password).
   * @returns Access token, public user, and the raw refresh token.
   * @throws ConflictException if the email is already registered.
   */
  public async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const user = await this.userService.createUser({
      email: dto.email,
      name: dto.name,
      role: dto.role,
      password: dto.password,
    });

    return this.buildAuthResult(user);
  }

  /**
   * Verifies credentials and issues an access + refresh token pair.
   *
   * @param dto - Login payload (email and plaintext password).
   * @returns Access token, public user, and the raw refresh token.
   * @throws UnauthorizedException if the email or password is invalid.
   */
  public async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordMatches = await this.userService.verifyPassword(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.buildAuthResult(user);
  }

  /**
   * Consumes a refresh token, rotates it, and issues a new access token. The
   * user record is re-read so demotions/promotions take effect on next refresh.
   *
   * @param rawRefreshToken - The raw refresh token from the client cookie.
   * @returns Fresh access token, public user, and a rotated refresh token.
   * @throws UnauthorizedException for missing/expired/revoked tokens
   *         (and triggers family revocation on reuse).
   */
  public async refresh(rawRefreshToken: string): Promise<AuthResult> {
    const previous =
      await this.refreshTokenService.validateAndConsume(rawRefreshToken);

    let user: UserEntity;
    try {
      user = await this.userService.findById(previous.userId);
    } catch {
      throw new UnauthorizedException("User no longer exists");
    }

    const refreshToken = await this.refreshTokenService.rotate(previous);
    return {
      accessToken: this.signAccessToken(user),
      user: AuthService.toPublicUser(user),
      refreshToken,
    };
  }

  /**
   * Revokes the given refresh token server-side. Idempotent — unknown or
   * already-revoked tokens silently succeed so stale cookies don't break UX.
   *
   * @param rawRefreshToken - The raw refresh token from the client cookie.
   */
  public async logout(rawRefreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeOne(rawRefreshToken);
  }

  /**
   * Maps a UserEntity to the public-facing user shape (strips sensitive fields).
   *
   * @param user - The user entity to project.
   * @returns The user payload safe to return over the wire.
   */
  public static toPublicUser(user: UserEntity): AuthResponse["user"] {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Issues a fresh access + refresh pair for an authenticated user.
   *
   * @param user - The authenticated user entity.
   * @returns Access token, public user, and the raw refresh token.
   */
  private async buildAuthResult(user: UserEntity): Promise<AuthResult> {
    const refreshToken = await this.refreshTokenService.issueNewFamily(user.id);
    return {
      accessToken: this.signAccessToken(user),
      user: AuthService.toPublicUser(user),
      refreshToken,
    };
  }

  /**
   * Signs a short-lived JWT access token for the given user.
   *
   * @param user - The user the token represents.
   * @returns A signed JWT string.
   */
  private signAccessToken(user: UserEntity): string {
    const payload: JwtPayload = { sub: user.id };
    return this.jwtService.sign(payload);
  }
}
