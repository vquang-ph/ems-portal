import { render, screen } from "@testing-library/react";
import { Todo } from "@ems-portal/types";
import { describe, it, expect, vi, beforeEach } from "vitest";
import useTodosQuery from "../../hooks/queries/useTodosQuery";
import TodoOverview from "../TodoOverview";
import { mockedTodos, TODO_OVERVIEW_TEST_IDS } from "../../test";

const TEXT = {
  loading: "Loading todos...",
} as const;

vi.mock("../../hooks/queries/useTodosQuery.ts", () => ({
  default: vi.fn(),
}));

vi.mock("../../components/TodoHeader", () => ({
  default: () => <div data-testid={TODO_OVERVIEW_TEST_IDS.header} />,
}));

vi.mock("../../components/TodoCreateDialog", () => ({
  default: () => <div data-testid={TODO_OVERVIEW_TEST_IDS.createDialog} />,
}));

const todoListSpy = vi.fn();
vi.mock("../../components/TodoList", () => ({
  default: (props: { todos: Todo[] }) => {
    todoListSpy(props);
    return <div data-testid={TODO_OVERVIEW_TEST_IDS.list} />;
  },
}));

const useTodosQueryMock = vi.mocked(useTodosQuery);

describe("TodoOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when query is loading", () => {
    useTodosQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useTodosQuery>);

    render(<TodoOverview />);

    expect(screen.getByText(TEXT.loading)).toBeInTheDocument();
    expect(
      screen.queryByTestId(TODO_OVERVIEW_TEST_IDS.header),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(TODO_OVERVIEW_TEST_IDS.list),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(TODO_OVERVIEW_TEST_IDS.createDialog),
    ).not.toBeInTheDocument();
  });

  it("renders loading state when data is missing (even if not loading)", () => {
    useTodosQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useTodosQuery>);

    render(<TodoOverview />);

    expect(screen.getByText(TEXT.loading)).toBeInTheDocument();
  });

  it("renders header, list, and create dialog when data exists", () => {
    useTodosQueryMock.mockReturnValue({
      data: mockedTodos,
      isLoading: false,
    } as ReturnType<typeof useTodosQuery>);

    render(<TodoOverview />);

    expect(screen.queryByText(TEXT.loading)).not.toBeInTheDocument();

    expect(
      screen.getByTestId(TODO_OVERVIEW_TEST_IDS.header),
    ).toBeInTheDocument();
    expect(screen.getByTestId(TODO_OVERVIEW_TEST_IDS.list)).toBeInTheDocument();
    expect(
      screen.getByTestId(TODO_OVERVIEW_TEST_IDS.createDialog),
    ).toBeInTheDocument();

    // verify TodoList received todos prop
    expect(todoListSpy).toHaveBeenCalledTimes(1);
    expect(todoListSpy).toHaveBeenCalledWith(
      expect.objectContaining({ todos: mockedTodos }),
    );
  });
});
