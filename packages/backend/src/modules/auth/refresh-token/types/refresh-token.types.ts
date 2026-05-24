import { RefreshTokenEntity } from "../entities/refresh-token.entity";

export type RevokeIfActiveResult =
  | { status: "consumed"; record: RefreshTokenEntity }
  | { status: "not_found" }
  | { status: "expired" }
  | { status: "reuse"; familyId: string };
