import { useMutation } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useNavigate } from "@tanstack/react-router";
import { queryClient } from "@/lib/queryClient";
import authApi from "../../api/authApi";
import authKeys from "../../cache/authKeys";
import { sessionAtom } from "../../store/sessionAtom";

const useLogoutMutation = () => {
  const setSession = useSetAtom(sessionAtom);
  const navigate = useNavigate();

  return useMutation({
    mutationKey: authKeys.mutation.logout(),
    mutationFn: () => authApi.logout(),
    // Always run local cleanup, even if server-side revocation failed. The
    // error stays on mutation.error for callers that want to surface it.
    onSettled: async () => {
      setSession(null);
      queryClient.clear();
      await navigate({ to: "/login" });
    },
  });
};

export default useLogoutMutation;
