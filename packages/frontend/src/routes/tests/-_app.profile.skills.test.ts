import { describe, it, expect, vi, beforeEach } from "vitest";
import { isRedirect } from "@tanstack/react-router";
import { UserRole, type User } from "@ems-portal/types";
import { jotaiStore } from "@/lib/jotaiStore";
import { Route } from "../_authenticated/_app/profile/skills";

vi.mock("@/lib/jotaiStore", () => ({
  jotaiStore: { get: vi.fn() },
}));

const jotaiGetMock = vi.mocked(jotaiStore.get);

const fakeUser = (role: UserRole): User => ({
  id: "user_1",
  email: "u@ems.local",
  name: "Test",
  role,
  createdAt: new Date(),
  updatedAt: null,
});

const callBeforeLoad = () =>
  (Route.options.beforeLoad as (arg: unknown) => unknown)({});

describe("/profile/skills route guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to / when the user is a client", () => {
    jotaiGetMock.mockReturnValue(fakeUser(UserRole.Client));

    let thrown: unknown;
    try {
      callBeforeLoad();
    } catch (e) {
      thrown = e;
    }

    expect(isRedirect(thrown)).toBe(true);
  });

  it("does not redirect for service providers", () => {
    jotaiGetMock.mockReturnValue(fakeUser(UserRole.ServiceProvider));

    expect(() => callBeforeLoad()).not.toThrow();
  });
});
