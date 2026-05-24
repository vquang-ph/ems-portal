import {
  AuthResponseSchema,
  LoginSchema,
  RegisterSchema,
  UserSchema,
} from "@ems-portal/types";
import { createZodDto } from "nestjs-zod";

export class LoginDto extends createZodDto(LoginSchema) {}

export class RegisterDto extends createZodDto(RegisterSchema) {}

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}

export class UserDto extends createZodDto(UserSchema) {}
