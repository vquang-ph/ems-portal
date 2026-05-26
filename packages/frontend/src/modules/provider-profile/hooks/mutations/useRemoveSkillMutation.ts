import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import providerProfileApi from "../../api/providerProfileApi";
import providerProfileKeys from "../../cache/providerProfileKeys";

const useRemoveSkillMutation = () => {
  return useMutation({
    mutationKey: providerProfileKeys.mutation.removeSkill(),
    mutationFn: (skillId: number) => providerProfileApi.removeSkill(skillId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerProfileKeys.query.me(),
      });
    },
  });
};

export default useRemoveSkillMutation;
