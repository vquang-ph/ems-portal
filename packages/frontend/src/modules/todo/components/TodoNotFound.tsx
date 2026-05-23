import { Card, CardContent } from "@/components/ui/card";

const TodoNotFound = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-gray-600">Task not found</p>
      </CardContent>
    </Card>
  );
};

export default TodoNotFound;
