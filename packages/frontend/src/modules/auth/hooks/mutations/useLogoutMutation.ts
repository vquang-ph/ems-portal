import { useMutation } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useNavigate } from "@tanstack/react-router";
import { queryClient } from "@/lib/queryClient";
import authKeys from "../../cache/authKeys";
import { sessionAtom } from "../../store/sessionAtom";

const useLogoutMutation = () => {
  const setSession = useSetAtom(sessionAtom);
  const navigate = useNavigate();

  return useMutation({
    mutationKey: authKeys.mutation.logout(),
    mutationFn: () => Promise.resolve(),
    onSuccess: async () => {
      setSession(null);
      queryClient.clear();
      await navigate({ to: "/login" });
    },
  });
};

export default useLogoutMutation;
