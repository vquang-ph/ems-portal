import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import authApi from "../api/authApi";
import { sessionAtom } from "../store/sessionAtom";
import { parseObjectWithDates } from "@/utils/parseObjectWithDates";
import type { User } from "@ems-portal/types";

/**
 * On mount, if a session exists in localStorage, refresh the access token
 * proactively using the httpOnly refresh cookie. This ensures tokens are
 * fresh before the first API request, eliminating 401→refresh→retry latency.
 */
const useSessionRefresh = () => {
  const session = useAtomValue(sessionAtom);
  const setSession = useSetAtom(sessionAtom);

  useEffect(() => {
    if (!session) return;

    const refreshToken = async () => {
      try {
        const response = await authApi.refresh();
        const user = parseObjectWithDates<User>(response.user);
        setSession({ accessToken: response.accessToken, user });
      } catch {
        // If refresh fails (expired refresh token, network error, etc.),
        // leave the session as-is. The axios interceptor will handle the
        // next 401 and clear the session if needed.
      }
    };

    void refreshToken();
  }, [session, setSession]);
};

export default useSessionRefresh;
