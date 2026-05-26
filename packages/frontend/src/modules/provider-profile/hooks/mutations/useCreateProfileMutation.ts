import { useMutation } from "@tanstack/react-query";
import type { CreateProviderProfile } from "@ems-portal/types";
import { queryClient } from "@/lib/queryClient";
import providerProfileApi from "../../api/providerProfileApi";
import providerProfileKeys from "../../cache/providerProfileKeys";

const useCreateProfileMutation = () => {
  return useMutation({
    mutationKey: providerProfileKeys.mutation.create(),
    mutationFn: (data: CreateProviderProfile) =>
      providerProfileApi.createProfile(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: providerProfileKeys.query.me(),
      });
    },
  });
};

export default useCreateProfileMutation;
