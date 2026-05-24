import { apiClient } from "@/lib/apiClient";
import { parseObjectWithDates } from "@/utils/parseObjectWithDates";
import type { AuthResponse, Login, Register, User } from "@ems-portal/types";

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

  async me(): Promise<User> {
    const res = await apiClient.get<User>("/auth/me");
    return parseObjectWithDates<User>(res.data);
  },
} as const;

export default authApi;
