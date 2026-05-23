import { useMutation } from "@tanstack/react-query";
import { TodoCreate } from "@ems-portal/types";
import { queryClient } from "@/lib/queryClient";
import todoKeys from "../../cache/todoKeys";
import todoApi from "../../api/todoApi";

const useCreateTodoMutation = () => {
  return useMutation({
    mutationKey: todoKeys.mutation.create(),
    mutationFn: (data: TodoCreate) => todoApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todoKeys.query.list() });
    },
  });
};

export default useCreateTodoMutation;
