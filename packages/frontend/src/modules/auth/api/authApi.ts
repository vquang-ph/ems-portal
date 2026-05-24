import { apiClient } from "@/lib/apiClient";
import { parseObjectWithDates } from "@/utils/parseObjectWithDates";
import type {
  AuthResponse,
  Login,
  Register,
  RefreshResponse,
  User,
} from "@ems-portal/types";

const authApi = {
  async login(body: Login): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", body);
    return {
      ...res.data,
      user: parseObjectWithDates<User>(res.data.user),
    };
  },

  async register(body: Register): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", body);
    return {
      ...res.data,
      user: parseObjectWithDates<User>(res.data.user),
    };
  },

  async refresh(): Promise<RefreshResponse> {
    const res = await apiClient.post<RefreshResponse>("/auth/refresh");
    return {
      ...res.data,
      user: parseObjectWithDates<User>(res.data.user),
    };
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async me(): Promise<User> {
    const res = await apiClient.get<User>("/auth/me");
    return parseObjectWithDates<User>(res.data);
  },
} as const;

export default authApi;
