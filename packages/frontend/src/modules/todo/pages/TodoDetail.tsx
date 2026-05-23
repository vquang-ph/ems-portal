import { useParams } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import TodoNotFound from "../components/TodoNotFound";
import TodoDetailHeader from "../components/TodoDetailHeader";
import TodoInfo from "../components/TodoInfo";
import useTodoQuery from "../hooks/queries/useTodoQuery";
import TodoEditDialog from "../components/TodoEditDialog";

const TodoDetail = () => {
  const { todoId } = useParams({ from: "/_todoLayout/$todoId/" });
  const { data: todo, isLoading } = useTodoQuery(todoId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!todo) {
    return <TodoNotFound />;
  }

  return (
    <Card>
      <TodoDetailHeader id={todo.id} title={todo.title} status={todo.status} />
      <CardContent className="space-y-6">
        <TodoInfo
          description={todo.description}
          createdAt={todo.createdAt}
          status={todo.status}
        />
      </CardContent>
      <TodoEditDialog todo={todo} />
    </Card>
  );
};

export default TodoDetail;
