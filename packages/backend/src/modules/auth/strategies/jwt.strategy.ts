import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { authConfig } from "@/config/auth.config";
import type { UserEntity } from "@/modules/user/entites/user.entity";
import { UserService } from "@/modules/user/user.service";

export interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig(configService).jwtSecret,
    });
  }

  public async validate(payload: JwtPayload): Promise<UserEntity> {
    try {
      return await this.userService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException("User no longer exists");
    }
  }
}
