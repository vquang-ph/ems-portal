import { apiUrl } from "@/common/constants";
import axios, { AxiosInstance } from "axios";

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
  }

  get instance(): AxiosInstance {
    return this.client;
  }

  private normalizeBaseUrl(baseUrl: string): string {
    if (baseUrl.endsWith("/")) {
      return baseUrl.slice(0, -1);
    }
    return baseUrl;
  }
}

export const apiClient = new ApiClient(apiUrl).instance;
