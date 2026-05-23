import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TodoDetailHeader from "../TodoDetailHeader";
import getStatusColor from "../../utils/getStatusColor";
import { useSetAtom } from "jotai";

const TODO_DETAIL_HEADER_TEST_IDS = {
  deleteButton: "todo-detail-header-delete-button",
} as const;

const UI_COMPONENTS_TEST_IDS = {
  cardHeader: "ui-card-header",
  cardTitle: "ui-card-title",
  badge: "ui-badge",
  button: "ui-button",
  pencilIcon: "ui-pencil-icon",
} as const;

const MOCKED_STATUS_COLOR = "bg-slate-500";

vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    useSetAtom: vi.fn(),
  };
});

vi.mock("@/components/ui/card", () => ({
  CardHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid={UI_COMPONENTS_TEST_IDS.cardHeader} data-class={className}>
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h2 data-testid={UI_COMPONENTS_TEST_IDS.cardTitle} data-class={className}>
      {children}
    </h2>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <span data-testid={UI_COMPONENTS_TEST_IDS.badge} data-class={className}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    ...rest
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
  }) => (
    <button
      data-testid={UI_COMPONENTS_TEST_IDS.button}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  ),
}));

vi.mock("lucide-react", () => ({
  Pencil: (props: Record<string, unknown>) => (
    <svg data-testid={UI_COMPONENTS_TEST_IDS.pencilIcon} {...props} />
  ),
}));

vi.mock("../TodoDeleteButton.tsx", () => ({
  default: ({ todoId }: { todoId: string }) => (
    <button data-testid={TODO_DETAIL_HEADER_TEST_IDS.deleteButton}>
      delete-{todoId}
    </button>
  ),
}));

vi.mock("../../utils/getStatusColor.ts", () => ({
  default: vi.fn(),
}));

const useSetAtomMock = vi.mocked(useSetAtom);
const getStatusColorMock = vi.mocked(getStatusColor);

describe("TodoDetailHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title, status badge, edit button, and delete button", () => {
    const setEditTodoDialog = vi.fn();
    useSetAtomMock.mockReturnValue(setEditTodoDialog);

    getStatusColorMock.mockReturnValue(MOCKED_STATUS_COLOR);

    render(<TodoDetailHeader id="t1" title="Buy milk" status="in-progress" />);

    expect(
      screen.getByTestId(UI_COMPONENTS_TEST_IDS.cardHeader),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(UI_COMPONENTS_TEST_IDS.cardTitle),
    ).toHaveTextContent("Buy milk");

    const badge = screen.getByTestId(UI_COMPONENTS_TEST_IDS.badge);
    expect(badge).toHaveTextContent("in-progress");
    expect(badge.getAttribute("data-class")).toBe(MOCKED_STATUS_COLOR);

    expect(
      screen.getByTestId(UI_COMPONENTS_TEST_IDS.button),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(UI_COMPONENTS_TEST_IDS.pencilIcon),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(TODO_DETAIL_HEADER_TEST_IDS.deleteButton),
    ).toHaveTextContent("delete-t1");
  });

  it("calls getStatusColor with the given status", () => {
    const setEditTodoDialog = vi.fn();
    useSetAtomMock.mockReturnValue(setEditTodoDialog);

    getStatusColorMock.mockReturnValue(MOCKED_STATUS_COLOR);

    render(<TodoDetailHeader id="t1" title="Buy milk" status="completed" />);

    expect(getStatusColorMock).toHaveBeenCalledTimes(1);
    expect(getStatusColorMock).toHaveBeenCalledWith("completed");
  });

  it("clicking the edit button sets editTodoDialog atom to true", async () => {
    const user = userEvent.setup();

    const setEditTodoDialog = vi.fn();
    useSetAtomMock.mockReturnValue(setEditTodoDialog);

    getStatusColorMock.mockReturnValue(MOCKED_STATUS_COLOR);

    render(<TodoDetailHeader id="t1" title="Buy milk" status="todo" />);

    await user.click(screen.getByTestId(UI_COMPONENTS_TEST_IDS.button));

    expect(setEditTodoDialog).toHaveBeenCalledTimes(1);
    expect(setEditTodoDialog).toHaveBeenCalledWith(true);
  });
});
