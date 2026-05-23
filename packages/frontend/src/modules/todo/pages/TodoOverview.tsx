import TodoCreateDialog from "../components/TodoCreateDialog";
import TodoHeader from "../components/TodoHeader";
import TodoList from "../components/TodoList";
import useTodosQuery from "../hooks/queries/useTodosQuery";

const TodoOverview = () => {
  const { data, isLoading } = useTodosQuery();

  if (isLoading || !data) {
    return <div>Loading todos...</div>;
  }

  return (
    <div className="space-y-8">
      <TodoHeader />
      <TodoList todos={data} />
      <TodoCreateDialog />
    </div>
  );
};

export default TodoOverview;
