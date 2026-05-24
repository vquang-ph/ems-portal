import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  UserDto,
} from "./dto/auth.dto";
import { CurrentUser } from "./decorators/current-user.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { UserEntity } from "@/modules/user/entites/user.entity";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  public constructor(private readonly service: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new Client or Service Provider" })
  public async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.service.register(dto);
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Log in with email + password" })
  public async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.service.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get the currently authenticated user" })
  public me(@CurrentUser() user: UserEntity): UserDto {
    return AuthService.toPublicUser(user);
  }
}
