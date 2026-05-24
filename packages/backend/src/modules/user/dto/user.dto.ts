import type { User } from "@ems-portal/types";

export type CreateUserInput = Pick<User, "email" | "name" | "role"> & {
  password: string;
};
