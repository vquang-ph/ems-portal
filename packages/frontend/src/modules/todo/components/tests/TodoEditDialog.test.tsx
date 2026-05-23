import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoStatus } from "@ems-portal/types";
import { createStore } from "jotai";
import TodoEditDialog from "../TodoEditDialog";
import useUpdateTodoMutation from "../../hooks/mutations/useUpdateTodoMutation";
import editTodoDialogAtom from "../../store/editTodoDialogAtom";
import renderWithStore from "@/test/renderWithStore";
import { UI_COMPONENTS_TEST_IDS } from "@/test/testIds";
import { mockedSingleTodo } from "../../test";

const TEXT = {
  title: "Edit todo",
  cancel: "Cancel",
  save: "Save",
  saving: "Saving...",
} as const;

const LABELS = {
  title: "Title",
  description: "Description",
  status: "Status",
} as const;

vi.mock("../../hooks/mutations/useUpdateTodoMutation", () => ({
  default: vi.fn(),
}));
const useUpdateTodoMutationMock = vi.mocked(useUpdateTodoMutation);

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

      {open ? (
        <div data-testid={UI_COMPONENTS_TEST_IDS.dialogRoot}>{children}</div>
      ) : null}
    </div>
  ),

  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid={UI_COMPONENTS_TEST_IDS.dialogContent}>{children}</div>
  ),

  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid={UI_COMPONENTS_TEST_IDS.dialogHeader}>{children}</div>
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

const mockedChangedTodoTitle = mockedSingleTodo.title + " changed";
const mockedChangedTodoDescription = mockedSingleTodo.description + " changed";

describe("TodoEditDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when editTodoDialog atom is false", () => {
    const store = createStore();
    store.set(editTodoDialogAtom, false);

    useUpdateTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateTodoMutation>);

    renderWithStore(<TodoEditDialog todo={mockedSingleTodo} />, store);

    expect(screen.queryByText(TEXT.title)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(UI_COMPONENTS_TEST_IDS.dialogRoot),
    ).not.toBeInTheDocument();
  });

  it("renders the dialog and pre-fills the form when editTodoDialog atom is true", () => {
    const store = createStore();
    store.set(editTodoDialogAtom, true);

    useUpdateTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateTodoMutation>);

    renderWithStore(<TodoEditDialog todo={mockedSingleTodo} />, store);

    expect(screen.getByText(TEXT.title)).toBeInTheDocument();

    expect(screen.getByLabelText(LABELS.title)).toHaveValue(
      mockedSingleTodo.title,
    );
    expect(screen.getByLabelText(LABELS.description)).toHaveValue(
      mockedSingleTodo.description,
    );
    expect(screen.getByLabelText(LABELS.status)).toHaveValue(
      mockedSingleTodo.status,
    );

    expect(
      screen.getByRole("button", { name: TEXT.cancel }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: TEXT.save })).toBeInTheDocument();
  });

  it("clicking Cancel closes the dialog and resets the form back to todo values", async () => {
    const user = userEvent.setup();

    const store = createStore();
    store.set(editTodoDialogAtom, true);

    useUpdateTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateTodoMutation>);

    renderWithStore(<TodoEditDialog todo={mockedSingleTodo} />, store);

    // Change values
    await user.clear(screen.getByLabelText(LABELS.title));
    await user.type(
      screen.getByLabelText(LABELS.title),
      mockedChangedTodoTitle,
    );
    await user.clear(screen.getByLabelText(LABELS.description));
    await user.type(
      screen.getByLabelText(LABELS.description),
      mockedChangedTodoDescription,
    );
    await user.selectOptions(
      screen.getByLabelText(LABELS.status),
      TodoStatus.Completed,
    );

    expect(screen.getByLabelText(LABELS.title)).toHaveValue(
      mockedChangedTodoTitle,
    );

    // Cancel closes and resets
    await user.click(screen.getByRole("button", { name: TEXT.cancel }));

    expect(store.get(editTodoDialogAtom)).toBe(false);
    expect(
      screen.queryByTestId(UI_COMPONENTS_TEST_IDS.dialogRoot),
    ).not.toBeInTheDocument();

    // Reopen and ensure reset to todo defaults
    await user.click(screen.getByTestId(UI_COMPONENTS_TEST_IDS.dialogOpen));
    expect(store.get(editTodoDialogAtom)).toBe(true);

    expect(screen.getByLabelText(LABELS.title)).toHaveValue(
      mockedSingleTodo.title,
    );
    expect(screen.getByLabelText(LABELS.description)).toHaveValue(
      mockedSingleTodo.description,
    );
    expect(screen.getByLabelText(LABELS.status)).toHaveValue(
      mockedSingleTodo.status,
    );
  });

  it("submitting valid data calls mutate with { id, data } and closes on success", async () => {
    const user = userEvent.setup();

    const store = createStore();
    store.set(editTodoDialogAtom, true);

    const mutate = vi.fn((vars, options) => {
      options?.onSuccess?.(undefined, vars, undefined);
    });

    useUpdateTodoMutationMock.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateTodoMutation>);

    renderWithStore(<TodoEditDialog todo={mockedSingleTodo} />, store);

    await user.clear(screen.getByLabelText(LABELS.title));
    await user.type(
      screen.getByLabelText(LABELS.title),
      mockedChangedTodoTitle,
    );

    await user.clear(screen.getByLabelText(LABELS.description));
    await user.type(
      screen.getByLabelText(LABELS.description),
      mockedChangedTodoDescription,
    );

    await user.selectOptions(
      screen.getByLabelText(LABELS.status),
      TodoStatus.Pending,
    );

    await user.click(screen.getByRole("button", { name: TEXT.save }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      {
        id: mockedSingleTodo.id,
        data: {
          title: mockedChangedTodoTitle,
          description: mockedChangedTodoDescription,
          status: TodoStatus.Pending,
        },
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );

    expect(store.get(editTodoDialogAtom)).toBe(false);
  });

  it("disables buttons and shows 'Saving...' when isPending is true", () => {
    const store = createStore();
    store.set(editTodoDialogAtom, true);

    useUpdateTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useUpdateTodoMutation>);

    renderWithStore(<TodoEditDialog todo={mockedSingleTodo} />, store);

    const cancelButton = screen.getByRole("button", { name: TEXT.cancel });
    expect(cancelButton).toBeDisabled();

    const saveButton = screen.getByRole("button", { name: TEXT.saving });
    expect(saveButton).toBeDisabled();
  });

  it("resets the form when Dialog onOpenChange closes the dialog", async () => {
    const user = userEvent.setup();

    const store = createStore();
    store.set(editTodoDialogAtom, true);

    useUpdateTodoMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateTodoMutation>);

    renderWithStore(<TodoEditDialog todo={mockedSingleTodo} />, store);

    // Change a field
    await user.clear(screen.getByLabelText(LABELS.title));
    await user.type(
      screen.getByLabelText(LABELS.title),
      mockedChangedTodoTitle,
    );
    expect(screen.getByLabelText(LABELS.title)).toHaveValue(
      mockedChangedTodoTitle,
    );

    // Close via dialog library (onOpenChange(false))
    await user.click(screen.getByTestId(UI_COMPONENTS_TEST_IDS.dialogClose));

    expect(store.get(editTodoDialogAtom)).toBe(false);
    expect(
      screen.queryByTestId(UI_COMPONENTS_TEST_IDS.dialogRoot),
    ).not.toBeInTheDocument();

    // Re-open, should be reset to todo values
    await user.click(screen.getByTestId(UI_COMPONENTS_TEST_IDS.dialogOpen));
    expect(store.get(editTodoDialogAtom)).toBe(true);

    expect(screen.getByLabelText(LABELS.title)).toHaveValue(
      mockedSingleTodo.title,
    );
    expect(screen.getByLabelText(LABELS.description)).toHaveValue(
      mockedSingleTodo.description,
    );
    expect(screen.getByLabelText(LABELS.status)).toHaveValue(
      mockedSingleTodo.status,
    );
  });
});
