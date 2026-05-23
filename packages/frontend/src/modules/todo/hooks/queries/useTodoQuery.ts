import { useQuery } from "@tanstack/react-query";
import todoKeys from "../../cache/todoKeys";
import todoApi from "../../api/todoApi";

const useTodoQuery = (id: string) => {
  return useQuery({
    queryKey: todoKeys.query.detail(id),
    queryFn: () => todoApi.getById(id),
  });
};

export default useTodoQuery;
