import { ForbiddenException } from "@nestjs/common";
import { assertOwnerOrAdmin } from "./assert-owner-or-admin";

const adminActor = { id: "admin-1", role: "admin" as const };
const clientActor = { id: "user-1", role: "client" as const };
const otherActor = { id: "user-2", role: "client" as const };

describe("assertOwnerOrAdmin", () => {
  it("does not throw for admin actor regardless of owner", () => {
    const resource = { userId: "someone-else" };
    expect(() =>
      assertOwnerOrAdmin(resource, "userId", adminActor),
    ).not.toThrow();
  });

  it("does not throw when non-admin actor matches the ownerKey", () => {
    const resource = { userId: "user-1" };
    expect(() =>
      assertOwnerOrAdmin(resource, "userId", clientActor),
    ).not.toThrow();
  });

  it("throws ForbiddenException when non-admin actor does not match ownerKey", () => {
    const resource = { userId: "user-1" };
    expect(() => assertOwnerOrAdmin(resource, "userId", otherActor)).toThrow(
      ForbiddenException,
    );
  });

  it("works with clientId ownerKey", () => {
    const resource = { clientId: "user-1" };
    expect(() =>
      assertOwnerOrAdmin(resource, "clientId", clientActor),
    ).not.toThrow();
  });

  it("works with providerId ownerKey", () => {
    const resource = { providerId: "user-2" };
    expect(() =>
      assertOwnerOrAdmin(resource, "providerId", otherActor),
    ).not.toThrow();
  });
});
