import { TodoStatus } from "@ems-portal/types";

const getStatusColor = (status: TodoStatus) => {
  switch (status) {
    case "todo":
      return "bg-slate-500";
    case "pending":
      return "bg-amber-500";
    case "in-progress":
      return "bg-blue-500";
    case "completed":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export default getStatusColor;
