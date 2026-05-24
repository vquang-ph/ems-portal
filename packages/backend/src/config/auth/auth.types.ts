export type ExpiresIn = `${number}${"s" | "m" | "h" | "d"}`;

export interface AuthConfig {
  jwtSecret: string;
  accessTokenExpiresIn: ExpiresIn;
  refreshTokenExpiresIn: ExpiresIn;
  refreshCookieName: string;
  refreshCookieSecure: boolean;
  refreshCookieDomain?: string;
}
