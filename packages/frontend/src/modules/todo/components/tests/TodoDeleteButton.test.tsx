import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoDeleteButton from "../TodoDeleteButton";
import useDeleteTodoMutation from "../../hooks/mutations/useDeleteTodoMutation";
import { useNavigate } from "@tanstack/react-router";
import { UI_COMPONENTS_TEST_IDS } from "@/test/testIds";
import { mockedTodoId } from "../../test";

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
  Trash2: (props: Record<string, unknown>) => (
    <svg data-testid={UI_COMPONENTS_TEST_IDS.trashIcon} {...props} />
  ),
}));

vi.mock("../../hooks/mutations/useDeleteTodoMutation.ts", () => ({
  default: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: vi.fn(),
}));

const useDeleteTodoMutationMock = vi.mocked(useDeleteTodoMutation);
const useNavigateMock = vi.mocked(useNavigate);

describe("TodoDeleteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trash icon when not pending and has title", () => {
    useDeleteTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteTodoMutation>);

    useNavigateMock.mockReturnValue(vi.fn());

    render(<TodoDeleteButton todoId={mockedTodoId} />);

    const btn = screen.getByTestId(UI_COMPONENTS_TEST_IDS.button);
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("title", "Delete Todo");

    expect(
      screen.getByTestId(UI_COMPONENTS_TEST_IDS.trashIcon),
    ).toBeInTheDocument();
    expect(screen.queryByText("Deleting...")).not.toBeInTheDocument();
  });

  it('renders "Deleting..." when pending', () => {
    useDeleteTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useDeleteTodoMutation>);

    useNavigateMock.mockReturnValue(vi.fn());

    render(<TodoDeleteButton todoId={mockedTodoId} />);

    expect(screen.getByText("Deleting...")).toBeInTheDocument();
    expect(
      screen.queryByTestId(UI_COMPONENTS_TEST_IDS.trashIcon),
    ).not.toBeInTheDocument();
  });

  it("clicking calls mutate(todoId) with onSuccess that navigates to /", async () => {
    const user = userEvent.setup();

    const navigate = vi.fn();
    useNavigateMock.mockReturnValue(navigate);

    const mutate = vi.fn((_id: string, opts?: { onSuccess?: () => void }) => {
      // Simulate mutation success to verify navigation behavior
      opts?.onSuccess?.();
    });

    useDeleteTodoMutationMock.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteTodoMutation>);

    render(<TodoDeleteButton todoId={mockedTodoId} />);

    await user.click(screen.getByTestId(UI_COMPONENTS_TEST_IDS.button));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      mockedTodoId,
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith({ to: "/" });
  });

  it("does not navigate if onSuccess is not called", async () => {
    const user = userEvent.setup();

    const navigate = vi.fn();
    useNavigateMock.mockReturnValue(navigate);

    const mutate = vi.fn(); // does not call onSuccess

    useDeleteTodoMutationMock.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteTodoMutation>);

    render(<TodoDeleteButton todoId={mockedTodoId} />);

    await user.click(screen.getByTestId(UI_COMPONENTS_TEST_IDS.button));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });
});
