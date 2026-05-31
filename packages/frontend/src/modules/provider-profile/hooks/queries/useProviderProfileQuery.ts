import { useQuery } from "@tanstack/react-query";
import providerProfileApi from "../../api/providerProfileApi";
import providerProfileKeys from "../../cache/providerProfileKeys";

const useProviderProfileQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: providerProfileKeys.query.byUser(userId ?? ""),
    queryFn: () => providerProfileApi.getProfileByUserId(userId as string),
    enabled: !!userId,
    retry: false,
  });
};

export default useProviderProfileQuery;
