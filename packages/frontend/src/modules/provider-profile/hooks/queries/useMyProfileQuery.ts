import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { UserRole } from "@ems-portal/types";
import { currentUserAtom } from "@/modules/auth";
import providerProfileApi from "../../api/providerProfileApi";
import providerProfileKeys from "../../cache/providerProfileKeys";

const useMyProfileQuery = () => {
  const user = useAtomValue(currentUserAtom);

  return useQuery({
    queryKey: providerProfileKeys.query.me(),
    queryFn: () => providerProfileApi.getMyProfile(),
    enabled: user?.role === UserRole.ServiceProvider,
    retry: false,
  });
};

export default useMyProfileQuery;
