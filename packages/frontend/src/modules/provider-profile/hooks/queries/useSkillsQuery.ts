import { useQuery } from "@tanstack/react-query";
import providerProfileApi from "../../api/providerProfileApi";
import providerProfileKeys from "../../cache/providerProfileKeys";

const useSkillsQuery = (categoryId?: number) => {
  return useQuery({
    queryKey: providerProfileKeys.query.skills(categoryId),
    queryFn: () => providerProfileApi.getSkills(categoryId),
    staleTime: Infinity,
  });
};

export default useSkillsQuery;
