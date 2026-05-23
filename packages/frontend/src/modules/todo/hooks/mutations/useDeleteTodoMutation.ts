import { useMutation } from "@tanstack/react-query";
import todoKeys from "../../cache/todoKeys";
import todoApi from "../../api/todoApi";
import { queryClient } from "@/lib/queryClient";

const useDeleteTodoMutation = () => {
  return useMutation({
    mutationKey: todoKeys.mutation.remove(),
    mutationFn: (id: string) => {
      return todoApi.remove(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: todoKeys.query.list(),
      });
    },
  });
};

export default useDeleteTodoMutation;
