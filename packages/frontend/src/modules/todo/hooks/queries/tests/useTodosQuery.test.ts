import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  QueryClient,
  QueryFunctionContext,
  QueryMeta,
  useQuery,
} from "@tanstack/react-query";
import useTodosQuery from "../useTodosQuery";
import todoKeys from "@/modules/todo/cache/todoKeys";
import todoApi from "@/modules/todo/api/todoApi";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("@/modules/todo/api/todoApi", () => ({
  default: {
    getAll: vi.fn(),
  },
}));

const useQueryMock = vi.mocked(useQuery);
const getAllMock = vi.mocked(todoApi.getAll);

describe("useTodosQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configures useQuery with the correct queryKey and queryFn", () => {
    useQueryMock.mockReturnValue({} as ReturnType<typeof useQuery>);

    renderHook(() => useTodosQuery());

    expect(useQueryMock).toHaveBeenCalledTimes(1);

    const options = useQueryMock.mock.calls[0]?.[0];
    expect(options).toBeDefined();
    if (!options) return;

    expect(options.queryKey).toEqual(todoKeys.query.list());
    expect(typeof options.queryFn).toBe("function");

    // queryFn should be lazy; hook should not call it immediately
    expect(getAllMock).not.toHaveBeenCalled();
  });

  it("the queryFn calls todoApi.getAll", () => {
    useQueryMock.mockReturnValue({} as ReturnType<typeof useQuery>);

    renderHook(() => useTodosQuery());

    const options = useQueryMock.mock.calls[0]?.[0];
    expect(options).toBeDefined();
    if (!options) return;

    const expectedKey = todoKeys.query.list();
    expect(options.queryKey).toEqual(expectedKey);

    const { queryFn } = options;
    expect(queryFn).toBeDefined();
    expect(typeof queryFn).toBe("function");

    if (typeof queryFn === "function") {
      const ctx: QueryFunctionContext<typeof expectedKey> = {
        queryKey: expectedKey,
        signal: new AbortController().signal,
        meta: undefined as QueryMeta | undefined,
        client: {} as QueryClient,
      };

      queryFn(ctx);

      expect(getAllMock).toHaveBeenCalledTimes(1);
    }
  });
});
