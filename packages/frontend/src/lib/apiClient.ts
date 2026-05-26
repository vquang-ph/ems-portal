import { apiUrl } from "@/common/constants";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import type { User } from "@ems-portal/types";
import { jotaiStore } from "@/lib/jotaiStore";
import { sessionAtom, tokenAtom } from "@/modules/auth/store/sessionAtom";
import { parseObjectWithDates } from "@/utils/parseObjectWithDates";

// Tag config so we don't retry the same request twice in a single refresh cycle.
interface RetriedConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

const AUTH_ROUTE_PATHS: ReadonlySet<string> = new Set([
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
  "/auth/logout",
]);

// Exact-pathname match so look-alike paths (e.g. /auth/login-history) or
// query strings don't accidentally opt out of the refresh-on-401 flow.
const isAuthRoute = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const { pathname } = new URL(url, "http://_");
    return AUTH_ROUTE_PATHS.has(pathname);
  } catch {
    return false;
  }
};

class ApiClient {
  private readonly client: AxiosInstance;
  // Module-scoped dedupe: N concurrent 401s share one refresh call.
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string) {
    const normalizedBaseUrl = this.normalizeBaseUrl(baseUrl);

    this.client = axios.create({
      baseURL: `${normalizedBaseUrl}/api`,
      headers: {
        "Content-Type": "application/json",
      },
      // Required for the refresh cookie to ride along on cross-port requests.
      withCredentials: true,
    });

    this.attachAuthHeader();
    this.handleUnauthorized();
  }

  get instance(): AxiosInstance {
    return this.client;
  }

  /**
   * Attaches the current access token (if any) as a Bearer header on outgoing
   * requests. Reads from the shared Jotai store so non-React callers and the
   * React tree stay in sync.
   */
  private attachAuthHeader(): void {
    this.client.interceptors.request.use((config) => {
      const token = jotaiStore.get(tokenAtom);
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      return config;
    });
  }

  /**
   * On 401, attempt a single deduped refresh. If it succeeds, replay the
   * original request with the new access token; otherwise clear the session
   * and redirect to /login.
   */
  private handleUnauthorized(): void {
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RetriedConfig | undefined;
        const status = error.response?.status;

        // 403 = authenticated but not authorized. Do NOT clear the session
        // or trigger a refresh; surface the error to the caller (TanStack
        // Query's `error` state) so components can render an inline message.
        if (status === 403) {
          throw error;
        }

        if (
          status !== 401 ||
          !config ||
          config._retried ||
          isAuthRoute(config.url) ||
          jotaiStore.get(sessionAtom) === null
        ) {
          throw error;
        }

        try {
          const newToken = await this.refreshAccessToken();
          config._retried = true;
          config.headers.set("Authorization", `Bearer ${newToken}`);
          return await this.client.request(config);
        } catch (refreshError) {
          this.clearSessionAndRedirect();
          throw refreshError;
        }
      },
    );
  }

  /**
   * Calls /auth/refresh and updates the session atom. Concurrent callers
   * share a single in-flight promise to avoid burning multiple refresh
   * tokens (which would invalidate each other via rotation).
   */
  private async refreshAccessToken(): Promise<string> {
    this.refreshPromise ??= this.client
      .post<{ accessToken: string; user: unknown }>("/auth/refresh")
      .then(({ data }) => {
        const user = parseObjectWithDates<User>(data.user);
        jotaiStore.set(sessionAtom, { accessToken: data.accessToken, user });
        return data.accessToken;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  /**
   * Clears the local session and bounces to /login, skipping the redirect
   * when we're already there to avoid a noop reload.
   */
  private clearSessionAndRedirect(): void {
    if (jotaiStore.get(sessionAtom) !== null) {
      jotaiStore.set(sessionAtom, null);
    }
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.assign("/login");
    }
  }

  private normalizeBaseUrl(baseUrl: string): string {
    if (baseUrl.endsWith("/")) {
      return baseUrl.slice(0, -1);
    }
    return baseUrl;
  }
}

export const apiClient = new ApiClient(apiUrl).instance;
