import { apiUrl } from "@/common/constants";
import axios, { AxiosError, AxiosInstance } from "axios";
import { jotaiStore } from "@/lib/jotaiStore";
import { sessionAtom, tokenAtom } from "@/modules/auth/store/sessionAtom";

class ApiClient {
  private readonly client: AxiosInstance;

  constructor(baseUrl: string) {
    const normalizedBaseUrl = this.normalizeBaseUrl(baseUrl);

    this.client = axios.create({
      baseURL: `${normalizedBaseUrl}/api`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.attachAuthHeader();
    this.handleUnauthorized();
  }

  get instance(): AxiosInstance {
    return this.client;
  }

  private attachAuthHeader(): void {
    this.client.interceptors.request.use((config) => {
      const token = jotaiStore.get(tokenAtom);
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      return config;
    });
  }

  private handleUnauthorized(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (
          error.response?.status === 401 &&
          jotaiStore.get(sessionAtom) !== null
        ) {
          jotaiStore.set(sessionAtom, null);
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/login"
          ) {
            window.location.assign("/login");
          }
        }
        return Promise.reject(error);
      },
    );
  }

  private normalizeBaseUrl(baseUrl: string): string {
    if (baseUrl.endsWith("/")) {
      return baseUrl.slice(0, -1);
    }
    return baseUrl;
  }
}

export const apiClient = new ApiClient(apiUrl).instance;
