import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { UserRole, type User } from "@ems-portal/types";
import useMyProfileQuery from "../useMyProfileQuery";
import providerProfileApi from "@/modules/provider-profile/api/providerProfileApi";
import providerProfileKeys from "@/modules/provider-profile/cache/providerProfileKeys";
import { fakeProviderProfile } from "@/modules/provider-profile/test/fixtures";

const currentUserAtomMock: { value: User | null } = { value: null };

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    useAtomValue: () => currentUserAtomMock.value,
  };
});

vi.mock("@/modules/provider-profile/api/providerProfileApi", () => ({
  default: {
    getMyProfile: vi.fn(),
  },
}));

const useQueryMock = vi.mocked(useQuery);
const getMyProfileMock = vi.mocked(providerProfileApi.getMyProfile);

const fakeUser = (role: UserRole): User => ({
  id: "user_1",
  email: "p@ems.local",
  name: "Test",
  role,
  createdAt: new Date(),
  updatedAt: null,
});

describe("useMyProfileQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserAtomMock.value = null;
    useQueryMock.mockReturnValue({} as ReturnType<typeof useQuery>);
  });

  it("disables the query when no user is logged in", () => {
    renderHook(() => useMyProfileQuery());

    const options = useQueryMock.mock.calls[0]?.[0];
    expect(options?.enabled).toBe(false);
    expect(options?.queryKey).toEqual(providerProfileKeys.query.me());
  });

  it("disables the query when the user is a client", () => {
    currentUserAtomMock.value = fakeUser(UserRole.Client);

    renderHook(() => useMyProfileQuery());

    const options = useQueryMock.mock.calls[0]?.[0];
    expect(options?.enabled).toBe(false);
  });

  it("enables the query when the user is a service provider", () => {
    currentUserAtomMock.value = fakeUser(UserRole.ServiceProvider);

    renderHook(() => useMyProfileQuery());

    const options = useQueryMock.mock.calls[0]?.[0];
    expect(options?.enabled).toBe(true);
  });

  it("queryFn delegates to providerProfileApi.getMyProfile", async () => {
    currentUserAtomMock.value = fakeUser(UserRole.ServiceProvider);
    const profile = fakeProviderProfile();
    getMyProfileMock.mockResolvedValue(profile);

    renderHook(() => useMyProfileQuery());

    const options = useQueryMock.mock.calls[0]?.[0];
    if (!options || typeof options.queryFn !== "function") {
      throw new Error("expected queryFn");
    }

    const result = await options.queryFn({
      // queryFn context — minimal stub.
    } as Parameters<typeof options.queryFn>[0]);

    expect(getMyProfileMock).toHaveBeenCalledTimes(1);
    expect(result).toBe(profile);
  });
});
