import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  MutationMeta,
  QueryClient,
  useMutation,
  type MutationFunctionContext,
} from "@tanstack/react-query";
import type { Login } from "@ems-portal/types";
import useLoginMutation from "../useLoginMutation";
import authApi from "@/modules/auth/api/authApi";
import authKeys from "@/modules/auth/cache/authKeys";
import { queryClient } from "@/lib/queryClient";
import { fakeUser } from "@/modules/auth/test/fixtures";

const setSessionMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
  QueryClient: vi.fn(),
}));

vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    useSetAtom: () => setSessionMock,
  };
});

vi.mock("@/modules/auth/api/authApi", () => ({
  default: {
    login: vi.fn(),
  },
}));

vi.mock("@/lib/queryClient", () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

const useMutationMock = vi.mocked(useMutation);
const loginMock = vi.mocked(authApi.login);
const invalidateQueriesMock = vi.mocked(queryClient.invalidateQueries);

describe("useLoginMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configures useMutation with correct mutationKey, mutationFn, and onSuccess", () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);

    renderHook(() => useLoginMutation());

    const options = useMutationMock.mock.calls[0]?.[0];
    expect(options).toBeDefined();
    if (!options) return;

    expect(options.mutationKey).toEqual(authKeys.mutation.login());
    expect(typeof options.mutationFn).toBe("function");
    expect(typeof options.onSuccess).toBe("function");
  });

  it("mutationFn delegates to authApi.login", async () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);
    renderHook(() => useLoginMutation());

    const options = useMutationMock.mock.calls[0]?.[0];
    if (!options || typeof options.mutationFn !== "function") {
      throw new Error("expected mutationFn");
    }

    const payload: Login = { email: "a@b.test", password: "supersecret" };
    const ctx: MutationFunctionContext = {
      client: new QueryClient(),
      meta: undefined as MutationMeta | undefined,
    };

    await options.mutationFn(payload, ctx);

    expect(loginMock).toHaveBeenCalledWith(payload);
  });

  it("onSuccess sets session and invalidates me query", () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);
    renderHook(() => useLoginMutation());

    const options = useMutationMock.mock.calls[0]?.[0];
    if (!options || typeof options.onSuccess !== "function") {
      throw new Error("expected onSuccess");
    }

    const user = fakeUser();
    const response = { accessToken: "tok", user };
    const ctx: MutationFunctionContext = {
      client: new QueryClient(),
      meta: undefined as MutationMeta | undefined,
    };

    options.onSuccess(response, { email: "", password: "" }, undefined, ctx);

    expect(setSessionMock).toHaveBeenCalledWith({
      accessToken: "tok",
      user,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: authKeys.query.me(),
    });
  });
});
