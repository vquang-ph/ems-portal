import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import authApi from "../../api/authApi";
import authKeys from "../../cache/authKeys";
import { tokenAtom } from "../../store/sessionAtom";

const useMeQuery = () => {
  const token = useAtomValue(tokenAtom);

  return useQuery({
    queryKey: authKeys.query.me(),
    queryFn: () => authApi.me(),
    enabled: !!token,
  });
};

export default useMeQuery;
