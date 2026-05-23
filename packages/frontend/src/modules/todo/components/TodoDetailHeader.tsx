import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import getStatusColor from "../utils/getStatusColor";
import { Todo } from "@ems-portal/types";
import { useSetAtom } from "jotai";
import editTodoDialogAtom from "../store/editTodoDialogAtom";
import { Button } from "@/components/ui/button";
import TodoDeleteButton from "./TodoDeleteButton";
import { Pencil } from "lucide-react";

interface TodoDetailHeaderProps {
  id: string;
  title: string;
  status: Todo["status"];
}

const TodoDetailHeader = ({ id, title, status }: TodoDetailHeaderProps) => {
  const setEditTodoDialog = useSetAtom(editTodoDialogAtom);

  return (
    <CardHeader className="pb-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <Badge className={getStatusColor(status)}>{status}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditTodoDialog(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <TodoDeleteButton todoId={id} />
        </div>
      </div>
    </CardHeader>
  );
};

export default TodoDetailHeader;
