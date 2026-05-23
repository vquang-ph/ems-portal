import { useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import createTodoDialogAtom from "../store/createTodoDialogAtom";

const TodoHeader = () => {
  const setCreateTodoDialog = useSetAtom(createTodoDialogAtom);

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Todo Overview</h1>
        <p className="text-gray-600">Manage and track your tasks efficiently</p>
      </div>
      <Button
        aria-label="open-create-todo"
        onClick={() => setCreateTodoDialog(true)}
      >
        Create Todo
      </Button>
    </div>
  );
};

export default TodoHeader;
