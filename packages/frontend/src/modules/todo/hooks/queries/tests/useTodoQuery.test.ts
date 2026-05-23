import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  QueryClient,
  QueryFunctionContext,
  QueryMeta,
  useQuery,
} from "@tanstack/react-query";
import useTodoQuery from "../useTodoQuery";
import todoKeys from "@/modules/todo/cache/todoKeys";
import todoApi from "@/modules/todo/api/todoApi";
import { mockedTodoId } from "@/modules/todo/test";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("@/modules/todo/api/todoApi", () => ({
  default: {
    getById: vi.fn(),
  },
}));

const useQueryMock = vi.mocked(useQuery);
const getByIdMock = vi.mocked(todoApi.getById);

describe("useTodoQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configures useQuery with the correct queryKey and queryFn", () => {
    useQueryMock.mockReturnValue({} as ReturnType<typeof useQuery>);

    renderHook(() => useTodoQuery(mockedTodoId));

    expect(useQueryMock).toHaveBeenCalledTimes(1);

    const options = useQueryMock.mock.calls[0]?.[0];
    expect(options).toBeDefined();

    if (!options) return;

    expect(options.queryKey).toEqual(todoKeys.query.detail(mockedTodoId));
    expect(typeof options.queryFn).toBe("function");

    expect(getByIdMock).not.toHaveBeenCalled();
  });

  it("the queryFn calls todoApi.getById with the same id", () => {
    useQueryMock.mockReturnValue({} as ReturnType<typeof useQuery>);

    renderHook(() => useTodoQuery(mockedTodoId));

    const options = useQueryMock.mock.calls[0]?.[0];
    expect(options).toBeDefined();

    if (!options) return;

    const expectedKey = todoKeys.query.detail(mockedTodoId);
    expect(options.queryKey).toEqual(expectedKey);

    const { queryFn } = options;
    expect(queryFn).toBeDefined();
    expect(typeof queryFn).toBe("function");

    // Call queryFn
    if (typeof queryFn === "function") {
      // To satisfy TypeScript, we need to provide a full QueryFunctionContext
      const ctx: QueryFunctionContext<typeof expectedKey> = {
        queryKey: expectedKey,
        signal: new AbortController().signal,
        meta: undefined as QueryMeta | undefined,
        client: {} as QueryClient,
      };

      queryFn(ctx);

      expect(getByIdMock).toHaveBeenCalledTimes(1);
      expect(getByIdMock).toHaveBeenCalledWith(mockedTodoId);
    }
  });
});
