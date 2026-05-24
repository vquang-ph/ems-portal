import { AuthResponse } from "@ems-portal/types";

// Adds the raw refresh token to AuthResponse for the controller to set as a
// cookie. Never returned to the client in the response body.
export interface AuthResult extends AuthResponse {
  refreshToken: string;
}
