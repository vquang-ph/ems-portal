import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  MutationMeta,
  QueryClient,
  useMutation,
  type MutationFunctionContext,
} from "@tanstack/react-query";
import type { CreateProviderProfile } from "@ems-portal/types";
import useCreateProfileMutation from "../useCreateProfileMutation";
import providerProfileApi from "@/modules/provider-profile/api/providerProfileApi";
import providerProfileKeys from "@/modules/provider-profile/cache/providerProfileKeys";
import { queryClient } from "@/lib/queryClient";
import { fakeProviderProfile } from "@/modules/provider-profile/test/fixtures";

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
  QueryClient: vi.fn(),
}));

vi.mock("@/modules/provider-profile/api/providerProfileApi", () => ({
  default: {
    createProfile: vi.fn(),
  },
}));

vi.mock("@/lib/queryClient", () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

const useMutationMock = vi.mocked(useMutation);
const createProfileMock = vi.mocked(providerProfileApi.createProfile);
const invalidateQueriesMock = vi.mocked(queryClient.invalidateQueries);

describe("useCreateProfileMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configures useMutation with the correct key, fn, and onSuccess", () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);

    renderHook(() => useCreateProfileMutation());

    const options = useMutationMock.mock.calls[0]?.[0];
    expect(options).toBeDefined();
    if (!options) return;

    expect(options.mutationKey).toEqual(providerProfileKeys.mutation.create());
    expect(typeof options.mutationFn).toBe("function");
    expect(typeof options.onSuccess).toBe("function");
  });

  it("mutationFn delegates to providerProfileApi.createProfile", async () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);
    const profile = fakeProviderProfile();
    createProfileMock.mockResolvedValue(profile);

    renderHook(() => useCreateProfileMutation());

    const options = useMutationMock.mock.calls[0]?.[0];
    if (!options || typeof options.mutationFn !== "function") {
      throw new Error("expected mutationFn");
    }

    const payload: CreateProviderProfile = {
      bio: "hello",
      isAvailable: true,
    };
    const ctx: MutationFunctionContext = {
      client: new QueryClient(),
      meta: undefined as MutationMeta | undefined,
    };

    const result = await options.mutationFn(payload, ctx);

    expect(createProfileMock).toHaveBeenCalledWith(payload);
    expect(result).toBe(profile);
  });

  it("onSuccess invalidates providerProfileKeys.query.me()", () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);
    renderHook(() => useCreateProfileMutation());

    const options = useMutationMock.mock.calls[0]?.[0];
    if (!options || typeof options.onSuccess !== "function") {
      throw new Error("expected onSuccess");
    }

    const profile = fakeProviderProfile();
    const ctx: MutationFunctionContext = {
      client: new QueryClient(),
      meta: undefined as MutationMeta | undefined,
    };

    options.onSuccess(profile, {}, undefined, ctx);

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: providerProfileKeys.query.me(),
    });
  });
});
