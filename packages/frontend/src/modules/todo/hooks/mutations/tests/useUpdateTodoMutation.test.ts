import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  MutationMeta,
  QueryClient,
  useMutation,
  type MutationFunctionContext,
} from "@tanstack/react-query";
import type { TodoUpdate } from "@ems-portal/types";
import useUpdateTodoMutation from "../useUpdateTodoMutation";
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
    update: vi.fn(),
  },
}));

vi.mock("@/lib/queryClient", () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

const useMutationMock = vi.mocked(useMutation);
const updateMock = vi.mocked(todoApi.update);
const invalidateQueriesMock = vi.mocked(queryClient.invalidateQueries);

describe("useUpdateTodoMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configures useMutation with correct mutationKey, mutationFn, and onSuccess", () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);

    renderHook(() => useUpdateTodoMutation());

    expect(useMutationMock).toHaveBeenCalledTimes(1);

    const options = useMutationMock.mock.calls[0]?.[0];
    expect(options).toBeDefined();
    if (!options) return;

    expect(options.mutationKey).toEqual(todoKeys.mutation.update());
    expect(typeof options.mutationFn).toBe("function");
    expect(typeof options.onSuccess).toBe("function");

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });

  it("mutationFn calls todoApi.update(id, data)", async () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);

    renderHook(() => useUpdateTodoMutation());

    const options = useMutationMock.mock.calls[0]?.[0];
    expect(options).toBeDefined();
    if (!options) return;

    const { mutationFn } = options;
    expect(mutationFn).toBeDefined();
    expect(typeof mutationFn).toBe("function");
    if (typeof mutationFn !== "function") return;

    const payload: { id: string; data: TodoUpdate } = {
      id: mockedSingleTodo.id,
      data: {
        title: mockedSingleTodo.title,
        description: mockedSingleTodo.description,
        status: mockedSingleTodo.status,
      },
    };

    const ctx: MutationFunctionContext = {
      client: new QueryClient(),
      meta: undefined as MutationMeta | undefined,
    };

    await mutationFn(payload, ctx);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith(payload.id, payload.data);
  });

  it("onSuccess invalidates todoKeys.all", () => {
    useMutationMock.mockReturnValue({} as ReturnType<typeof useMutation>);

    renderHook(() => useUpdateTodoMutation());

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
      queryKey: todoKeys.all,
    });
  });
});
