import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import providerProfileApi from "../../api/providerProfileApi";
import providerProfileKeys from "../../cache/providerProfileKeys";

const usePublishProfileMutation = () => {
  return useMutation({
    mutationKey: providerProfileKeys.mutation.publish(),
    mutationFn: () => providerProfileApi.publishMyProfile(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerProfileKeys.query.me(),
      });
    },
  });
};

export default usePublishProfileMutation;
