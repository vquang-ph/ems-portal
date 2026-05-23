import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  MutationMeta,
  QueryClient,
  useMutation,
  type MutationFunctionContext,
} from "@tanstack/react-query";
import useDeleteTodoMutation from "../useDeleteTodoMutation";
import todoKeys from "@/modules/todo/cache/todoKeys";
import todoApi from "@/modules/todo/api/todoApi";
import { queryClient } from "@/lib/queryClient";
import { mockedSingleTodo } from "@/modules/todo/test";

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
  QueryClient: vi.fn(),
}));

vi.mock("@/modules/todo/api/todoApi", () => ({
  default: {
    remove: vi.fn(),
  },
}));

vi.mock("@/lib/queryClient", () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

const useMutationMock = vi.mocked(useMutation);
const removeMock = vi.mocked(todoApi.remove);
const invalidateQueriesMock = vi.mocked(queryClient.invalidateQueries);

describe("useDeleteTodoMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configures useMutation with correct mutationKey, mutationFn, and onSuccess", () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);

    renderHook(() => useDeleteTodoMutation());

    expect(useMutationMock).toHaveBeenCalledTimes(1);

    const options = useMutationMock.mock.calls[0]?.[0];
    expect(options).toBeDefined();
    if (!options) return;

    expect(options.mutationKey).toEqual(todoKeys.mutation.remove());
    expect(typeof options.mutationFn).toBe("function");
    expect(typeof options.onSuccess).toBe("function");

    expect(removeMock).not.toHaveBeenCalled();
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });

  it("mutationFn calls todoApi.remove(id)", async () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);

    renderHook(() => useDeleteTodoMutation());

    const options = useMutationMock.mock.calls[0]?.[0];
    expect(options).toBeDefined();
    if (!options) return;

    const { mutationFn } = options;
    expect(mutationFn).toBeDefined();
    expect(typeof mutationFn).toBe("function");
    if (typeof mutationFn !== "function") return;

    const ctx: MutationFunctionContext = {
      client: new QueryClient(),
      meta: undefined as MutationMeta | undefined,
    };

    await mutationFn(mockedSingleTodo.id, ctx);

    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledWith(mockedSingleTodo.id);
  });

  it("onSuccess invalidates the todos list query", () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);

    renderHook(() => useDeleteTodoMutation());

    const options = useMutationMock.mock.calls[0]?.[0];
    expect(options).toBeDefined();
    if (!options) return;

    const { onSuccess } = options;
    expect(onSuccess).toBeDefined();
    expect(typeof onSuccess).toBe("function");
    if (typeof onSuccess !== "function") return;

    const ctx: MutationFunctionContext = {
      client: new QueryClient(),
      meta: undefined as MutationMeta | undefined,
    };

    onSuccess(undefined, undefined, undefined, ctx);

    expect(invalidateQueriesMock).toHaveBeenCalledTimes(1);
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: todoKeys.query.list(),
    });
  });
});
