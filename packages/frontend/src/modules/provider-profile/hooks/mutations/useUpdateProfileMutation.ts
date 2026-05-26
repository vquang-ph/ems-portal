import { useMutation } from "@tanstack/react-query";
import type { UpdateProviderProfile } from "@ems-portal/types";
import { queryClient } from "@/lib/queryClient";
import providerProfileApi from "../../api/providerProfileApi";
import providerProfileKeys from "../../cache/providerProfileKeys";

const useUpdateProfileMutation = () => {
  return useMutation({
    mutationKey: providerProfileKeys.mutation.update(),
    mutationFn: (data: UpdateProviderProfile) =>
      providerProfileApi.updateMyProfile(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerProfileKeys.query.me(),
      });
    },
  });
};

export default useUpdateProfileMutation;
