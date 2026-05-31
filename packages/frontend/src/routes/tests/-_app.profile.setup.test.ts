import { describe, it, expect, vi, beforeEach } from "vitest";
import { isRedirect } from "@tanstack/react-router";
import { UserRole, type User } from "@ems-portal/types";
import { jotaiStore } from "@/lib/jotaiStore";
import { Route } from "../_authenticated/_app/profile/setup";

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
  // The Route's beforeLoad doesn't use its arg; pass an empty object.
  (Route.options.beforeLoad as (arg: unknown) => unknown)({});

describe("/profile/setup route guard", () => {
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

  it("redirects to / when there is no current user", () => {
    jotaiGetMock.mockReturnValue(null);

    let thrown: unknown;
    try {
      callBeforeLoad();
    } catch (e) {
      thrown = e;
    }

    expect(isRedirect(thrown)).toBe(true);
  });

  it("does not redirect when the user is a service provider", () => {
    jotaiGetMock.mockReturnValue(fakeUser(UserRole.ServiceProvider));

    expect(() => callBeforeLoad()).not.toThrow();
  });
});
