import { Todo } from "@ems-portal/types";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
}

const TodoList = ({ todos }: TodoListProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All Tasks</h2>
      <div className="grid gap-4">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
};

export default TodoList;
