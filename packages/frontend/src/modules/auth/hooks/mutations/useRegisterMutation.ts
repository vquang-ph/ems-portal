import { useMutation } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import type { Register } from "@ems-portal/types";
import { queryClient } from "@/lib/queryClient";
import authApi from "../../api/authApi";
import authKeys from "../../cache/authKeys";
import { sessionAtom } from "../../store/sessionAtom";

const useRegisterMutation = () => {
  const setSession = useSetAtom(sessionAtom);

  return useMutation({
    mutationKey: authKeys.mutation.register(),
    mutationFn: (data: Register) => authApi.register(data),
    onSuccess: (response) => {
      setSession({
        accessToken: response.accessToken,
        user: response.user,
      });
      void queryClient.invalidateQueries({ queryKey: authKeys.query.me() });
    },
  });
};

export default useRegisterMutation;
