import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Todo } from "@ems-portal/types";
import TodoList from "../TodoList";
import { mockedTodos, TODO_LIST_TEST_IDS } from "../../test";

type TodoItemProps = { todo: Todo };
const todoItemSpy = vi.fn<(props: TodoItemProps) => void>();

vi.mock("../TodoItem.tsx", () => ({
  default: (props: TodoItemProps) => {
    todoItemSpy(props);
    return <div data-testid={TODO_LIST_TEST_IDS.item} />;
  },
}));

describe("TodoList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the "All Tasks" heading', () => {
    render(<TodoList todos={mockedTodos} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /all tasks/i }),
    ).toBeInTheDocument();
  });

  it("renders one TodoItem per todo", () => {
    render(<TodoList todos={mockedTodos} />);

    const items = screen.getAllByTestId(TODO_LIST_TEST_IDS.item);
    expect(items).toHaveLength(mockedTodos.length);

    // We should also see the spy called once per item
    expect(todoItemSpy).toHaveBeenCalledTimes(mockedTodos.length);
  });

  it("passes the correct todo prop to each TodoItem", () => {
    render(<TodoList todos={mockedTodos} />);

    // Ensure we called TodoItem with each todo object
    expect(todoItemSpy).toHaveBeenCalledTimes(mockedTodos.length);

    mockedTodos.forEach((todo, index) => {
      expect(todoItemSpy).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({ todo }),
      );
    });
  });

  it("renders zero TodoItem when todos is empty", () => {
    render(<TodoList todos={[]} />);

    expect(screen.queryAllByTestId(TODO_LIST_TEST_IDS.item)).toHaveLength(0);
  });
});
