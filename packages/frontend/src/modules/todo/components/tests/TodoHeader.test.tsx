import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSetAtom } from "jotai";
import TodoHeader from "../TodoHeader";
import createTodoDialogAtom from "../../store/createTodoDialogAtom";

vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    useSetAtom: vi.fn(),
  };
});
const useSetAtomMock = vi.mocked(useSetAtom);

vi.mock("@/components/ui/button", () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  ),
}));

describe("TodoHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets createTodoDialogAtom to true when "Create Todo" is clicked', async () => {
    const user = userEvent.setup();

    const setAtom = vi.fn<(value: boolean) => void>();
    useSetAtomMock.mockReturnValue(setAtom);

    render(<TodoHeader />);

    await user.click(screen.getByRole("button", { name: "open-create-todo" }));

    // Verify setter for the correct atom
    expect(useSetAtomMock).toHaveBeenCalledWith(createTodoDialogAtom);

    // Verify time called
    expect(setAtom).toHaveBeenCalledTimes(1);
    expect(setAtom).toHaveBeenCalledWith(true);
  });
});
