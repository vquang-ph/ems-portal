import { useAtomValue } from "jotai";
import {
  currentUserAtom,
  isAuthenticatedAtom,
  tokenAtom,
} from "../store/sessionAtom";
import useLogoutMutation from "./mutations/useLogoutMutation";

const useSession = () => {
  const user = useAtomValue(currentUserAtom);
  const token = useAtomValue(tokenAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const { mutate: logout } = useLogoutMutation();

  return { user, token, isAuthenticated, logout };
};

export default useSession;
