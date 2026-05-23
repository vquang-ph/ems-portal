import { useAtom } from "jotai";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TodoCreate, TodoCreateSchema, TodoStatus } from "@ems-portal/types";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useCreateTodoMutation from "../hooks/mutations/useCreateTodoMutation";
import createTodoDialogAtom from "../store/createTodoDialogAtom";
import { TodoSelect } from "./TodoSelect";

const TodoCreateDialog = () => {
  const [createTodoDialog, setCreateTodoDialog] = useAtom(createTodoDialogAtom);

  const { mutate, isPending } = useCreateTodoMutation();

  const form = useForm<TodoCreate>({
    resolver: zodResolver(TodoCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TodoStatus.Todo,
    },
  });

  const onSubmit = (data: TodoCreate) => {
    mutate(data, {
      onSuccess: () => {
        setCreateTodoDialog(false);
      },
    });
  };

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit(onSubmit)();
  };

  const closeDialog = () => {
    setCreateTodoDialog(false);
    form.reset();
  };

  return (
    <Dialog
      open={createTodoDialog}
      onOpenChange={(nextOpen) => {
        setCreateTodoDialog(nextOpen);
        if (!nextOpen) {
          form.reset();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new todo</DialogTitle>
        </DialogHeader>
        <form id="create-todo-form" onSubmit={handleOnSubmit}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-todo-title">Title</FieldLabel>
                  <Input
                    {...field}
                    id="create-todo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Buy milk"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Keep it short and descriptive.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-todo-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="create-todo-description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Add more details..."
                    rows={4}
                  />
                  <FieldDescription>
                    Provide context so you know what to do later.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Status</FieldLabel>
                  <TodoSelect value={field.value} onChange={field.onChange} />
                  <FieldDescription>The status of the task.</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <Field
            orientation="horizontal"
            className="mt-4 flex justify-end gap-2"
          >
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" form="create-todo-form" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </Field>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TodoCreateDialog;
