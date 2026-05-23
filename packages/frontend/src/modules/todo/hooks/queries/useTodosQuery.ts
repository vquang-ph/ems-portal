import { useQuery } from "@tanstack/react-query";
import todoKeys from "../../cache/todoKeys";
import todoApi from "../../api/todoApi";

const useTodosQuery = () => {
  return useQuery({
    queryKey: todoKeys.query.list(),
    queryFn: () => todoApi.getAll(),
  });
};

export default useTodosQuery;
