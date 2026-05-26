import { useQuery } from "@tanstack/react-query";
import providerProfileApi from "../../api/providerProfileApi";
import providerProfileKeys from "../../cache/providerProfileKeys";

const useSkillCategoriesQuery = () => {
  return useQuery({
    queryKey: providerProfileKeys.query.categories(),
    queryFn: () => providerProfileApi.getSkillCategories(),
    staleTime: Infinity,
  });
};

export default useSkillCategoriesQuery;
