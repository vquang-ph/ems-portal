import { useMutation } from "@tanstack/react-query";
import type { AddProviderSkill } from "@ems-portal/types";
import { queryClient } from "@/lib/queryClient";
import providerProfileApi from "../../api/providerProfileApi";
import providerProfileKeys from "../../cache/providerProfileKeys";

const useAddSkillMutation = () => {
  return useMutation({
    mutationKey: providerProfileKeys.mutation.addSkill(),
    mutationFn: (data: AddProviderSkill) => providerProfileApi.addSkill(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerProfileKeys.query.me(),
      });
    },
  });
};

export default useAddSkillMutation;
