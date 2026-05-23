import { Todo, TodoUpdate, TodoUpdateSchema } from "@ems-portal/types";
import { useAtom } from "jotai";
import editTodoDialogAtom from "../store/editTodoDialogAtom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useUpdateTodoMutation from "../hooks/mutations/useUpdateTodoMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { TodoSelect } from "./TodoSelect";

interface ITodoEditDialogProps {
  todo: Todo;
}

const TodoEditDialog = ({ todo }: ITodoEditDialogProps) => {
  const [open, setOpen] = useAtom(editTodoDialogAtom);

  const { mutate, isPending } = useUpdateTodoMutation();

  const form = useForm<TodoUpdate>({
    resolver: zodResolver(TodoUpdateSchema),
    defaultValues: {
      title: todo.title,
      description: todo.description,
      status: todo.status,
    },
  });

  const onSubmit = (data: TodoUpdate) => {
    mutate(
      { id: todo.id, data: data },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit(onSubmit)();
  };

  const closeDialog = () => {
    setOpen(false);
    form.reset({
      title: todo.title,
      description: todo.description,
      status: todo.status,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset({
            title: todo.title,
            description: todo.description,
            status: todo.status,
          });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit todo</DialogTitle>
        </DialogHeader>
        <form id="edit-todo-form" onSubmit={handleOnSubmit}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-todo-title">Title</FieldLabel>
                  <Input
                    {...field}
                    id="edit-todo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Buy milk"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Update the title of this todo.
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
                  <FieldLabel htmlFor="edit-todo-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="edit-todo-description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Add more details..."
                    rows={4}
                  />
                  <FieldDescription>Update the description.</FieldDescription>
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
                  <FieldDescription>
                    Change the current status of the task.
                  </FieldDescription>
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
            <Button type="submit" form="edit-todo-form" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </Field>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TodoEditDialog;
