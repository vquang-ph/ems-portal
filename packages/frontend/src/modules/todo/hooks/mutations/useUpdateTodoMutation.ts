import { useMutation } from "@tanstack/react-query";
import { TodoUpdate } from "@ems-portal/types";
import { queryClient } from "@/lib/queryClient";
import todoKeys from "../../cache/todoKeys";
import todoApi from "../../api/todoApi";

type TodoUpdateMutation = {
  id: string;
  data: TodoUpdate;
};

const useUpdateTodoMutation = () => {
  return useMutation({
    mutationKey: todoKeys.mutation.update(),
    mutationFn: (payload: TodoUpdateMutation) =>
      todoApi.update(payload.id, payload.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: todoKeys.all,
      });
    },
  });
};

export default useUpdateTodoMutation;
