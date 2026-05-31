import { UserRole } from "@ems-portal/types";
import type { CreateUserInput } from "../../../modules/user/dto/user.dto";

// Dev-only seed credentials. Override APP_JWT_SECRET in any non-dev environment
// and rotate these out the moment a real signup flow exists.
export const INITIAL_USERS: CreateUserInput[] = [
  {
    email: "admin@ems.local",
    name: "Platform Admin",
    role: UserRole.Admin,
    password: "password123",
  },
  {
    email: "provider@ems.local",
    name: "Sample Service Provider",
    role: UserRole.ServiceProvider,
    password: "password123",
  },
  {
    email: "client@ems.local",
    name: "Sample Client",
    role: UserRole.Client,
    password: "password123",
  },
];
