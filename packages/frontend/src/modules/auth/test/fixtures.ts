import { UserRole, type User } from "@ems-portal/types";
import type { Session } from "../store/sessionAtom";

export const fakeUser = (overrides: Partial<User> = {}): User => ({
  id: "user_1",
  email: "client@ems.local",
  name: "Test Client",
  role: UserRole.Client,
  createdAt: new Date("2026-05-24T00:00:00.000Z"),
  updatedAt: null,
  ...overrides,
});

export const fakeSession = (overrides: Partial<Session> = {}): Session => ({
  accessToken: "test-token",
  user: fakeUser(),
  ...overrides,
});
