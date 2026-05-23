import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import getStatusColor from "../utils/getStatusColor";
import { Todo } from "@ems-portal/types";

interface TodoItemProps {
  todo: Todo;
}

const TodoItem = ({ todo }: TodoItemProps) => {
  return (
    <Link to={"/$todoId"} params={{ todoId: todo.id }}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{todo.title}</CardTitle>
            <Badge className={getStatusColor(todo.status)}>{todo.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm line-clamp-2">
            {todo.description}
          </p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-gray-500 text-xs">
              Created: {todo.createdAt.toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TodoItem;
