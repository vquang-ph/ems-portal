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
import type { JwtPayload } from "./strategies/jwt.strategy";

@Injectable()
export class AuthService {
  public constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public async register(dto: RegisterDto): Promise<AuthResponse> {
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

    return this.buildAuthResponse(user);
  }

  public async login(dto: LoginDto): Promise<AuthResponse> {
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

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: UserEntity): AuthResponse {
    const payload: JwtPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: AuthService.toPublicUser(user),
    };
  }

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
}
