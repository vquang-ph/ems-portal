# RBAC Design Concept

**Status:** Draft / design concept.
**Scope:** How role-based access control should be implemented across the platform. Builds on `roles-and-identity.md`.

---

## 1. Current State

What's already in the codebase (`packages/backend/src/modules/auth/`):

- 3 roles in shared types: `client`, `service_provider`, `admin`. `PUBLIC_USER_ROLE_VALUES` keeps `admin` out of `/register`.
- `JwtAuthGuard` populates `request.user` with a full `UserEntity` (role included) via per-request DB lookup in `jwt.strategy.ts`.
- `RolesGuard` + `@Roles()` decorator exist but are **explicitly placeholders** — flat "is your role in this set?" check, not registered globally.
- `RolesGuard` is provided in `AuthModule` but not applied to any controller.

What's missing: anything finer than "user has role X." No permission model, no ownership checks, no admin hierarchy, no frontend awareness.

---

## 2. Layered Model

RBAC should be split into **three layers**, each answering a different question. Skipping any layer creates a gap.

### Layer 1 — Role check (coarse, route-level)

The existing `RolesGuard` machinery, made real.

**Changes required:**

1. **Wire `JwtAuthGuard` globally** via `APP_GUARD` and add a `@Public()` decorator (`SetMetadata('isPublic', true)`) for `/auth/login`, `/auth/register`, `/auth/refresh`, `/health`. Default-secure routing — eliminates the "forgot to add `@UseGuards`" failure mode.
2. **Wire `RolesGuard` globally** the same way so `@Roles(UserRole.Admin)` on a handler is sufficient without `@UseGuards` boilerplate.
3. **Admin implicit grant:** in `RolesGuard.canActivate`, if `user.role === UserRole.Admin`, return `true` before the `includes` check. Today an admin would be denied from a `@Roles(UserRole.Client)` route.

### Layer 2 — Permission check (verb + resource)

Roles answer "who"; permissions answer "can do what." Once a Service Provider can do _some_ things a Client can't and _some_ things a Client can, role enums alone tangle.

**Proposed shape:**

```ts
// packages/shared/types/src/auth/permission.schema.ts
export const PERMISSION_VALUES = [
  "job:create",
  "job:read:any",
  "job:read:own",
  "job:update:own",
  "profile:update:own",
  "rating:create",
  "user:manage",
  "system:configure",
  "dispute:resolve",
] as const;
export type Permission = (typeof PERMISSION_VALUES)[number];
```

```ts
// packages/backend/src/modules/auth/rbac/role-permissions.ts
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  client: [
    "job:create",
    "job:read:own",
    "job:update:own",
    "profile:update:own",
    "rating:create",
  ],
  service_provider: ["job:read:any", "profile:update:own", "rating:create"],
  admin: PERMISSION_VALUES,
};
```

Then a `@RequirePermissions('job:create')` decorator + `PermissionsGuard` reads `ROLE_PERMISSIONS[user.role]`. Controllers express **intent** (`job:create`), not **who** (`client`). When `client` later splits into `client` + `enterprise_client`, you change the map — not 40 controllers.

**Where stored:** In-code map (above) on day one. Move to a DB table only if non-developers need to edit it. Most RBAC systems over-engineer this prematurely.

### Layer 3 — Ownership / attribute check (per-resource)

"Client can update _their own_ profile" can't be answered without loading the resource. **Do not** express this in a decorator — keep it in the service:

```ts
public async update(id: string, dto: UpdateProfileDto, actor: UserEntity) {
  const profile = await this.repo.findOneOrFail(id);
  if (profile.userId !== actor.id && actor.role !== UserRole.Admin) {
    throw new ForbiddenException();
  }
  // ...
}
```

A `@Owns('profile')` decorator is tempting but rejected: it either double-fetches the resource (perf) or leaks domain knowledge into the auth layer (coupling). A small `assertOwnerOrAdmin(resource, actor)` helper in `common/auth/` keeps the check explicit at the call site.

---

## 3. API-level vs. Resource-level — Both Are Required

Both layers exist because each catches what the other misses.

| Question                                              | Layer            | Mechanism             |
| ----------------------------------------------------- | ---------------- | --------------------- |
| "Can clients create jobs?"                            | API              | `@RequirePermissions` |
| "Can admins delete users?"                            | API              | `@RequirePermissions` |
| "Can this client edit _this_ job?"                    | Resource         | `assertOwnerOrAdmin`  |
| "Can this provider see _this_ client's contact info?" | Resource         | Service-layer check   |
| "Can only published jobs be applied to?"              | Resource (state) | Service-layer check   |

**Naming convention:** `:any` and `:create` are API-level. `:own` always implies a resource-level check too — the permission tells you the _role can_; the service check enforces the _which instance_. Cheap belt-and-braces.

Skip API-level and every service method has to re-check authentication — easy to forget, silent escalation. Skip resource-level and `job:update:own` becomes a lie because the guard has no resource context.

---

## 4. Other Decisions

### 4.1 JWT payload — include role?

- **Pro:** Skip the per-request `findById` in `JwtStrategy`.
- **Con:** Role changes don't take effect until the access token expires (~15 min).

Given access tokens are short-lived and `/refresh` already re-reads the user (`auth.service.ts:84`), embedding `role` in the JWT is reasonable. Optionally keep the DB lookup as a cache invalidation path. Decide explicitly before implementing.

### 4.2 Frontend mirror

Export `hasPermission(user, permission)` from `@ems-portal/types` so route guards and conditional rendering share the source of truth with the backend. Enforcement stays backend-only — the frontend uses it for UX, not security.

### 4.3 Audit logging

Forbidden attempts on sensitive permissions (`user:manage`, `system:configure`) should be logged. Add at the `PermissionsGuard` level once.

### 4.4 Tests

`RolesGuard` has no `*.spec.ts` today. Cover before relying on it. Add specs for `PermissionsGuard` and any ownership helpers as they land.

---

## 5. Rollout Order

1. Add `@Public()` + global `JwtAuthGuard` / `RolesGuard` (default-secure routing).
2. Add admin implicit grant in `RolesGuard`.
3. Introduce `Permission` enum + `ROLE_PERMISSIONS` map + `PermissionsGuard` + `@RequirePermissions()`. Migrate one feature module as the reference.
4. Add `assertOwnerOrAdmin` helper; apply in services that touch user-owned resources.
5. Decide on JWT role embedding.
6. Frontend `hasPermission` helper + route guards.

Steps 1–2 are cleanup of existing placeholders. Step 3 is the real RBAC introduction. Steps 4–6 fall out naturally.
