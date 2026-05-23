import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import useDeleteTodoMutation from "../hooks/mutations/useDeleteTodoMutation";
import { useNavigate } from "@tanstack/react-router";

interface TodoDeleteButtonProps {
  todoId: string;
}

const TodoDeleteButton = ({ todoId }: TodoDeleteButtonProps) => {
  const { mutate, isPending } = useDeleteTodoMutation();
  const navigate = useNavigate();

  const handleDelete = () => {
    mutate(todoId, {
      onSuccess: () => {
        void navigate({ to: "/" });
      },
    });
  };

  return (
    <Button variant="destructive" onClick={handleDelete} title="Delete Todo">
      {isPending ? "Deleting..." : <Trash2 className="h-4 w-4" />}
    </Button>
  );
};

export default TodoDeleteButton;
