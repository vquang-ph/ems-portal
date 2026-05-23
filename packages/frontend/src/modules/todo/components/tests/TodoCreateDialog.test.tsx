import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoStatus } from "@ems-portal/types";
import { createStore } from "jotai";
import TodoCreateDialog from "../TodoCreateDialog";
import useCreateTodoMutation from "../../hooks/mutations/useCreateTodoMutation";
import createTodoDialogAtom from "../../store/createTodoDialogAtom";
import renderWithStore from "@/test/renderWithStore";
import { mockedSingleTodo } from "../../test";
import { UI_COMPONENTS_TEST_IDS } from "@/test/testIds";

const TEXT = {
  title: "Create a new todo",
  cancel: "Cancel",
  create: "Create",
  creating: "Creating...",
} as const;

const LABELS = {
  title: "Title",
  description: "Description",
  status: "Status",
} as const;

vi.mock("../../hooks/mutations/useCreateTodoMutation", () => ({
  default: vi.fn(),
}));
const useCreateTodoMutationMock = vi.mocked(useCreateTodoMutation);

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (nextOpen: boolean) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid={UI_COMPONENTS_TEST_IDS.dialogWrapper}>
      <button
        type="button"
        data-testid={UI_COMPONENTS_TEST_IDS.dialogOpen}
        onClick={() => onOpenChange(true)}
      >
        open
      </button>
      <button
        type="button"
        data-testid={UI_COMPONENTS_TEST_IDS.dialogClose}
        onClick={() => onOpenChange(false)}
      >
        close
      </button>

      {open ? <div data-testid="dialog-root">{children}</div> : null}
    </div>
  ),

  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),

  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),

  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

vi.mock("@/components/ui/field", () => ({
  FieldGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Field: ({
    children,
    ...rest
  }: React.HTMLAttributes<HTMLDivElement> & { orientation?: string }) => (
    <div {...rest}>{children}</div>
  ),
  FieldLabel: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => <label htmlFor={htmlFor}>{children}</label>,
  FieldDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FieldError: ({ errors }: { errors: Array<unknown> }) => (
    <div role="alert">{errors.length > 0 ? "Invalid" : ""}</div>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} />
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  ),
}));

vi.mock("../TodoSelect.tsx", () => ({
  TodoSelect: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (next: string) => void;
  }) => (
    <label>
      {LABELS.status}
      <select
        aria-label={LABELS.status}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      >
        <option value={TodoStatus.Todo}>todo</option>
        <option value={TodoStatus.Pending}>pending</option>
        <option value={TodoStatus.InProgress}>in-progress</option>
        <option value={TodoStatus.Completed}>completed</option>
      </select>
    </label>
  ),
}));

describe("TodoCreateDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when createTodoDialog atom is false", () => {
    const store = createStore();
    store.set(createTodoDialogAtom, false);

    useCreateTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateTodoMutation>);

    renderWithStore(<TodoCreateDialog />, store);

    expect(screen.queryByText(TEXT.title)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(UI_COMPONENTS_TEST_IDS.dialogRoot),
    ).not.toBeInTheDocument();
  });

  it("renders the dialog and form when createTodoDialog atom is true", () => {
    const store = createStore();
    store.set(createTodoDialogAtom, true);

    useCreateTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateTodoMutation>);

    renderWithStore(<TodoCreateDialog />, store);

    expect(screen.getByText(TEXT.title)).toBeInTheDocument();

    expect(screen.getByLabelText(LABELS.title)).toBeInTheDocument();
    expect(screen.getByLabelText(LABELS.description)).toBeInTheDocument();
    expect(screen.getByLabelText(LABELS.status)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: TEXT.cancel }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: TEXT.create }),
    ).toBeInTheDocument();
  });

  it("clicking Cancel closes the dialog (sets atom to false)", async () => {
    const user = userEvent.setup();

    const store = createStore();
    store.set(createTodoDialogAtom, true);

    useCreateTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateTodoMutation>);

    renderWithStore(<TodoCreateDialog />, store);

    await user.click(screen.getByRole("button", { name: TEXT.cancel }));

    expect(store.get(createTodoDialogAtom)).toBe(false);
  });

  it("submitting valid data calls mutate and closes on success", async () => {
    const user = userEvent.setup();

    const store = createStore();
    store.set(createTodoDialogAtom, true);

    const mutate = vi.fn((_, options) => {
      options?.onSuccess?.(mockedSingleTodo, _, undefined);
    });

    useCreateTodoMutationMock.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateTodoMutation>);

    renderWithStore(<TodoCreateDialog />, store);

    await user.type(
      screen.getByLabelText(LABELS.title),
      mockedSingleTodo.title,
    );
    await user.type(
      screen.getByLabelText(LABELS.description),
      mockedSingleTodo.description,
    );

    await user.selectOptions(
      screen.getByLabelText(LABELS.status),
      mockedSingleTodo.status,
    );

    await user.click(screen.getByRole("button", { name: TEXT.create }));

    expect(mutate).toHaveBeenCalledTimes(1);

    expect(store.get(createTodoDialogAtom)).toBe(false);
  });

  it("disables buttons and shows 'Creating...' when isPending is true", () => {
    const store = createStore();
    store.set(createTodoDialogAtom, true);

    useCreateTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useCreateTodoMutation>);

    renderWithStore(<TodoCreateDialog />, store);

    const cancelButton = screen.getByRole("button", { name: TEXT.cancel });
    expect(cancelButton).toBeDisabled();

    const createButton = screen.getByRole("button", { name: TEXT.creating });
    expect(createButton).toBeDisabled();
  });

  it("resets the form when Dialog onOpenChange closes the dialog", async () => {
    const user = userEvent.setup();

    const store = createStore();
    store.set(createTodoDialogAtom, true);

    useCreateTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateTodoMutation>);

    renderWithStore(<TodoCreateDialog />, store);

    // Type into the form
    await user.type(
      screen.getByLabelText(LABELS.title),
      mockedSingleTodo.title,
    );
    expect(screen.getByLabelText(LABELS.title)).toHaveValue(
      mockedSingleTodo.title,
    );

    // Simulate the dialog library closing
    await user.click(screen.getByTestId(UI_COMPONENTS_TEST_IDS.dialogClose));

    // Dialog should now be closed
    expect(store.get(createTodoDialogAtom)).toBe(false);
    expect(
      screen.queryByTestId(UI_COMPONENTS_TEST_IDS.dialogRoot),
    ).not.toBeInTheDocument();
    // Re-open, the form should be reset
    await user.click(screen.getByTestId(UI_COMPONENTS_TEST_IDS.dialogOpen));
    expect(store.get(createTodoDialogAtom)).toBe(true);

    expect(screen.getByLabelText(LABELS.title)).toHaveValue("");
    expect(screen.getByLabelText(LABELS.description)).toHaveValue("");
    expect(screen.getByLabelText(LABELS.status)).toHaveValue(TodoStatus.Todo);
  });
});
