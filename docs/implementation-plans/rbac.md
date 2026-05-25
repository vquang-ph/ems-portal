# Implementation Plan: RBAC (Phase 2)

**Status:** Ready to implement
**Author handoff date:** 2026-05-25
**Spec anchors:** `docs/product-specs/rbac-design.md`, `docs/product-specs/roles-and-identity.md`, `docs/product-specs/data-model.md`
**Phase 1 handoff:** `docs/hand-offs/phase-1.md`

---

## 1. Goal

Wire Role-Based Access Control across the backend so that **every protected route is authorized at both the endpoint level (permission decorator + global guard) and the resource level (ownership check in service methods)**. The pattern must be ready for `provider_profiles`, `service_requests`, and admin user-management endpoints to adopt without further design work.

The frontend will mirror the permission map for UI affordances; the backend remains the source of truth.

---

## 2. Scope

### In scope

- Shared `Permission` enum and `ROLE_PERMISSIONS` map in `@ems-portal/types`.
- `@Public()` decorator + globally wired `JwtAuthGuard` (default-secure).
- `@RequirePermissions()` decorator + globally wired `PermissionsGuard` with admin implicit grant.
- `assertOwnerOrAdmin()` helper in `src/common/auth/` for Layer 3 checks.
- Retiring the placeholder `RolesGuard` / `@Roles()` (spec forbids role decorators on controllers).
- Marking existing public endpoints (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/health`, `/metrics`) with `@Public()`.
- Full unit + integration test coverage for the new guards, decorators, and helper.

### Out of scope (explicit follow-ups)

- **`users.status` / `users.deleted_at` migration.** RBAC ships against the current `UserEntity`. The known gap: a suspended user's already-issued access token remains valid up to 1h. Acceptable because no suspension endpoint exists yet — there is currently no way to suspend. A follow-up PR will add the columns and harden `JwtStrategy.validate()` to reject non-active users.
- `users.email_verified_at` / `users.last_login_at` (pure telemetry / feature-gating, not RBAC).
- `provider_profiles` module itself — RBAC lands first so this module can adopt the pattern from day one.
- Frontend `hasPermission` consumption — the export will exist, but UI changes are a separate PR.
- Audit logging of admin actions.

---

## 3. Design (anchored to `rbac-design.md`)

Three layers, in execution order per request:

| Layer       | Mechanism                                                                      | Location                                   |
| ----------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| 1. Endpoint | `@RequirePermissions('verb:resource:scope')` + `PermissionsGuard`              | Backend route handler                      |
| 2. Mapping  | `ROLE_PERMISSIONS: Record<Role, Permission[]>` + `hasPermission(role, perm)`   | `@ems-portal/types` (shared with frontend) |
| 3. Resource | `assertOwnerOrAdmin(resource, actor, ownerKey)` invoked inside service methods | Backend service layer                      |

**Why permissions, not roles, on controllers:** the spec mandates decoupling so roles can evolve (future "super admin" / "moderator" split) without rewriting controllers. Controllers declare _what action is being taken_; the permission map decides _which roles can take it_.

**Why ownership checks live in services, not decorators:** decorators run before the resource is loaded. Pushing ownership checks into decorators forces a double fetch or tight coupling to repository internals. Services already load the resource — they assert ownership inline.

**Admin implicit grant:** the `PermissionsGuard` short-circuits true when `user.role === 'admin'`. `assertOwnerOrAdmin` likewise lets admins through. This is the _only_ place admin gets special treatment; the permission map does not enumerate admin perms.

**Default-secure routing:** `JwtAuthGuard` runs globally. Routes without `@Public()` require an authenticated user. Today only `/auth/me` is authed; after this change the _omission_ of `@Public()` is what protects a route, not the _presence_ of `@UseGuards`.

---

## 4. File-by-file changes

### Create

| Path                                                                            | Purpose                                                                                                      |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `packages/shared/types/src/rbac.schema.ts`                                      | `PERMISSION_VALUES`, `PermissionSchema`, `Permission` type, `ROLE_PERMISSIONS` map, `hasPermission()` helper |
| `packages/backend/src/modules/auth/decorators/public.decorator.ts`              | `@Public()` + `IS_PUBLIC_KEY`                                                                                |
| `packages/backend/src/modules/auth/decorators/require-permissions.decorator.ts` | `@RequirePermissions(...perms)` + `PERMISSIONS_METADATA_KEY`                                                 |
| `packages/backend/src/modules/auth/guards/permissions.guard.ts`                 | `PermissionsGuard` — reads metadata, applies admin grant, calls `hasPermission`                              |
| `packages/backend/src/common/auth/assert-owner-or-admin.ts`                     | `assertOwnerOrAdmin()` helper                                                                                |
| `packages/backend/src/common/auth/index.ts`                                     | Barrel export for the helper                                                                                 |
| `packages/backend/src/modules/auth/guards/permissions.guard.spec.ts`            | Unit tests                                                                                                   |
| `packages/backend/src/modules/auth/guards/jwt-auth.guard.spec.ts`               | Unit tests (update if exists, create if not)                                                                 |
| `packages/backend/src/common/auth/assert-owner-or-admin.spec.ts`                | Unit tests                                                                                                   |

### Modify

| Path                                                         | Change                                                                                                   |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `packages/shared/types/src/index.ts`                         | Re-export from `./rbac.schema`                                                                           |
| `packages/backend/src/modules/auth/guards/jwt-auth.guard.ts` | Inject `Reflector`; honor `@Public()` metadata; otherwise delegate to `super.canActivate()`              |
| `packages/backend/src/modules/auth/auth.module.ts`           | Provide & export `PermissionsGuard`; remove `RolesGuard` from providers/exports                          |
| `packages/backend/src/app.module.ts`                         | Register `JwtAuthGuard` and `PermissionsGuard` as `APP_GUARD` in that order                              |
| `packages/backend/src/modules/auth/auth.controller.ts`       | Remove per-route `@UseGuards(JwtAuthGuard)`; add `@Public()` to `register`, `login`, `refresh`, `logout` |
| `packages/backend/src/modules/health/health.controller.ts`   | Add `@Public()` to `GET /health`                                                                         |
| `packages/backend/src/modules/metric/metric.controller.ts`   | Add `@Public()` to `GET /metrics`                                                                        |

### Delete

| Path                                                              | Reason                                                                     |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `packages/backend/src/modules/auth/guards/roles.guard.ts`         | Replaced by `PermissionsGuard`; spec forbids role-on-controller decorators |
| `packages/backend/src/modules/auth/decorators/roles.decorator.ts` | Same                                                                       |
| Any `roles.guard.spec.ts` / `roles.decorator.spec.ts`             | Same                                                                       |

Search for `@Roles(` and `RolesGuard` across the repo before deleting — confirm zero call sites (deep-explore reported none, but verify).

---

## 5. Implementation details

### 5.1 Shared types — `packages/shared/types/src/rbac.schema.ts`

```typescript
import { z } from "zod";
import { UserRoleSchema, type UserRole } from "./user.schema";

/**
 * Canonical permission strings in `verb:resource:scope` form.
 *
 * Scopes:
 *   - `own` — actor is the owner of the resource
 *   - `any` — applies regardless of ownership (typically admin/read-broad)
 *
 * Adding a permission here is a contract change; update the role map below.
 */
export const PERMISSION_VALUES = [
  // Provider profile
  "provider_profile:read:any",
  "provider_profile:create:own",
  "provider_profile:update:own",

  // Service request
  "service_request:create:own",
  "service_request:read:own",
  "service_request:update:own",
  "service_request:cancel:own",

  // Engagement
  "engagement:read:own",
  "engagement:update:own",

  // Rating
  "rating:create:own",

  // Admin user management
  "user:read:any",
  "user:suspend:any",
  "user:delete:any",
] as const;

export const PermissionSchema = z.enum(PERMISSION_VALUES);
export type Permission = z.infer<typeof PermissionSchema>;

/**
 * Role → permission map. Admin is intentionally omitted; the guard grants
 * admin implicit access at runtime. This keeps the admin grant in exactly
 * one place (guard + helper) instead of duplicating the full permission list.
 */
export const ROLE_PERMISSIONS: Record<
  Exclude<UserRole, "admin">,
  Permission[]
> = {
  client: [
    "provider_profile:read:any",
    "service_request:create:own",
    "service_request:read:own",
    "service_request:update:own",
    "service_request:cancel:own",
    "engagement:read:own",
    "rating:create:own",
  ],
  service_provider: [
    "provider_profile:create:own",
    "provider_profile:update:own",
    "engagement:read:own",
    "engagement:update:own",
  ],
};

/**
 * Returns true if the given role is permitted to perform the action.
 * Admin is always permitted.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  if (role === "admin") return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
```

> **Confirm before writing:** the actual export name for the role enum in `@ems-portal/types`. If it's `RoleSchema` / `Role`, adapt accordingly. Likewise verify whether `UserRoleSchema` is already exported from `user.schema.ts`.

After saving, run `yarn build:types` from the monorepo root — both backend and frontend need the rebuilt artifacts.

### 5.2 `@Public()` decorator

```typescript
// packages/backend/src/modules/auth/decorators/public.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "auth:is-public";

/**
 * Marks a route (or controller) as accessible without authentication.
 * Routes without this decorator require a valid JWT.
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
```

### 5.3 `@RequirePermissions()` decorator

```typescript
// packages/backend/src/modules/auth/decorators/require-permissions.decorator.ts
import { SetMetadata } from "@nestjs/common";
import type { Permission } from "@ems-portal/types";

export const PERMISSIONS_METADATA_KEY = "auth:required-permissions";

/**
 * Declares the permissions a caller must hold to invoke this handler.
 * All listed permissions must be satisfied (AND semantics).
 */
export const RequirePermissions = (
  ...permissions: Permission[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSIONS_METADATA_KEY, permissions);
```

### 5.4 `JwtAuthGuard` — extend to honor `@Public()`

```typescript
// packages/backend/src/modules/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Allows the request through when the handler or controller is marked
   * `@Public()`; otherwise enforces a valid JWT via the Passport strategy.
   */
  public canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

### 5.5 `PermissionsGuard`

```typescript
// packages/backend/src/modules/auth/guards/permissions.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasPermission, type Permission } from "@ems-portal/types";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { PERMISSIONS_METADATA_KEY } from "../decorators/require-permissions.decorator";
import { UserEntity } from "@/modules/user/entities/user.entity";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Allows public routes through unchecked; for protected routes, verifies
   * the authenticated user holds every permission listed by
   * `@RequirePermissions()`. Admin role bypasses the check.
   *
   * @param context - The Nest execution context for the current request.
   * @returns `true` when the caller is authorized.
   * @throws ForbiddenException when no authenticated user is present or
   *   when the caller lacks any required permission.
   */
  public canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true; // authed but no perm gate

    const request = context.switchToHttp().getRequest<{ user?: UserEntity }>();
    const user = request.user;
    if (!user) throw new ForbiddenException("Authentication required");

    if (user.role === "admin") return true;

    const ok = required.every((perm) => hasPermission(user.role, perm));
    if (!ok) throw new ForbiddenException("Insufficient permissions");
    return true;
  }
}
```

### 5.6 `assertOwnerOrAdmin`

```typescript
// packages/backend/src/common/auth/assert-owner-or-admin.ts
import { ForbiddenException } from "@nestjs/common";
import type { UserRole } from "@ems-portal/types";

interface Actor {
  id: string;
  role: UserRole;
}

/**
 * Throws ForbiddenException unless the actor owns the resource or is admin.
 *
 * @param resource - The loaded resource. Must carry an owner-identifying field.
 * @param ownerKey - The property on `resource` that holds the owner's user id
 *   (e.g. `"userId"`, `"clientId"`, `"providerId"`).
 * @param actor - The authenticated caller.
 * @throws ForbiddenException when the actor is neither the resource owner
 *   nor an admin.
 */
export function assertOwnerOrAdmin<
  T extends Record<K, string>,
  K extends keyof T,
>(resource: T, ownerKey: K, actor: Actor): void {
  if (actor.role === "admin") return;
  if (resource[ownerKey] === actor.id) return;
  throw new ForbiddenException("Not authorized for this resource");
}
```

The generic signature lets services call `assertOwnerOrAdmin(profile, "userId", actor)` or `assertOwnerOrAdmin(request, "clientId", actor)` without per-resource overloads.

### 5.7 Global wiring — `app.module.ts`

Order matters. Nest executes `APP_GUARD` providers in **registration order**, and `PermissionsGuard` reads `req.user`, which `JwtAuthGuard` populates.

```typescript
// packages/backend/src/app.module.ts (providers array — add these)
import { APP_GUARD } from "@nestjs/core";

import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "./modules/auth/guards/permissions.guard";

providers: [
  // ...existing APP_PIPE, APP_FILTER providers
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: PermissionsGuard },
],
```

Confirm `AuthModule` is imported by `app.module.ts` so the guards' dependencies (`Reflector`, Passport strategy) resolve. The Passport `JwtStrategy` must remain registered in `AuthModule`.

### 5.8 Endpoint updates

| Route                 | Change                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/register` | Add `@Public()`                                                                                                                              |
| `POST /auth/login`    | Add `@Public()`                                                                                                                              |
| `POST /auth/refresh`  | Add `@Public()` (cookie-based, intentionally unauthenticated)                                                                                |
| `POST /auth/logout`   | Add `@Public()` (always 204)                                                                                                                 |
| `GET /auth/me`        | Remove `@UseGuards(JwtAuthGuard)` — global guard now handles auth; no `@RequirePermissions` needed (any authed user reads their own profile) |
| `GET /health`         | Add `@Public()`                                                                                                                              |
| `GET /metrics`        | Add `@Public()`                                                                                                                              |

No `@RequirePermissions()` usage in this PR — no current endpoint needs one. The first real use will appear with the `provider_profiles` module.

---

## 6. Tests

### 6.1 `permissions.guard.spec.ts`

Cover:

1. Public route (handler has `@Public()`) → returns `true` without inspecting user.
2. No `@RequirePermissions` metadata → returns `true` (authed-only route).
3. No `req.user` on a permission-gated route → throws `ForbiddenException`.
4. `user.role === 'admin'` → returns `true` regardless of required perms.
5. Role with all required perms → returns `true`.
6. Role missing one of the required perms → throws `ForbiddenException`.
7. Multiple required perms (AND semantics) → only passes when all hold.

Mock `Reflector.getAllAndOverride` to return the desired metadata per case. Mock `ExecutionContext` with a minimal `switchToHttp().getRequest()` returning `{ user }`.

### 6.2 `jwt-auth.guard.spec.ts`

Cover:

1. `@Public()` → returns `true`, never calls `super.canActivate`.
2. No `@Public()` → delegates to `super.canActivate` (assert it's invoked).

Spy on the parent's `canActivate` or stub Passport's strategy entry point.

### 6.3 `assert-owner-or-admin.spec.ts`

Cover:

1. Admin actor, any owner → no throw.
2. Non-admin actor whose id matches `resource[ownerKey]` → no throw.
3. Non-admin actor whose id does not match → throws `ForbiddenException`.
4. Different `ownerKey` choices (`userId`, `clientId`) all work.

### 6.4 Integration — `auth.controller.int-spec.ts`

Extend existing integration tests:

1. `GET /auth/me` with no token → 401 (proves global `JwtAuthGuard` is active).
2. `GET /auth/me` with valid token → 200 + user payload (proves removal of per-route `@UseGuards` didn't break it).
3. `POST /auth/login` with no token → 200 (proves `@Public()` works).
4. `GET /health` with no token → 200 (proves `@Public()` on a non-auth controller).

A purpose-built smoke route for `@RequirePermissions` is **not** required in this PR — coverage is sufficient via unit tests, and the first real consumer (`provider_profiles`) will exercise it end-to-end. If the next agent wants extra confidence, register a throwaway test-only controller behind an `if (process.env.NODE_ENV === 'test')` guard.

### 6.5 Coverage threshold

Backend Jest enforces 80/80/80/70. The new files are small and fully testable — there's no excuse for dipping below threshold. Run `yarn test:cov` before opening the PR.

---

## 7. Acceptance criteria

- [ ] `Permission`, `ROLE_PERMISSIONS`, `hasPermission` exported from `@ems-portal/types`; `yarn build:types` succeeds; backend imports compile.
- [ ] `@Public()`, `@RequirePermissions()` decorators created and exported from `auth.module.ts` (or re-exported from a single auth barrel if one exists).
- [ ] `JwtAuthGuard` honors `@Public()`; `PermissionsGuard` enforces admin grant + permission map.
- [ ] Both guards registered as `APP_GUARD` in `app.module.ts`, **in the order `JwtAuthGuard` then `PermissionsGuard`**.
- [ ] `RolesGuard` and `@Roles()` deleted; `grep -r "RolesGuard\|@Roles(" packages/` returns zero results.
- [ ] All existing public routes carry `@Public()`; `/auth/me` carries neither (global auth, no perm gate).
- [ ] `assertOwnerOrAdmin` helper landed in `src/common/auth/`.
- [ ] `yarn lint`, `yarn test`, `yarn test:int`, `yarn test:cov` all pass; no `any` types introduced.
- [ ] Swagger UI at `/api/docs` still loads (a quick sanity check — Nest sometimes trips on guard wiring).
- [ ] Commit follows Conventional Commits (`feat(backend): wire global rbac guards` or similar).

---

## 8. Known gaps / follow-ups

These are explicitly **not** part of this PR. List them in the PR description so reviewers don't expect them:

1. **`users.status` + `users.deleted_at` migration** and `JwtStrategy.validate()` rejecting non-active users. Until this lands, suspending a user (no such endpoint exists yet) wouldn't take effect until their access token expires.
2. `users.email_verified_at`, `users.last_login_at` — phase-1 cleanup, unrelated to RBAC mechanics.
3. `provider_profiles` module — first real consumer of `@RequirePermissions` and `assertOwnerOrAdmin`.
4. Frontend `hasPermission` integration — types are exported, but no UI uses them yet.
5. Audit logging for admin actions (spec §4, low priority).
6. Permission groups / hierarchical permissions — the spec hints at a future "super admin" / "moderator" split; the current flat permission list anticipates this but doesn't implement it.

---

## 9. Quick reference for the next agent

**Order of operations for a clean PR:**

1. Shared types (`rbac.schema.ts`) → `yarn build:types`.
2. Decorators (`@Public`, `@RequirePermissions`).
3. Guards (`JwtAuthGuard` update, new `PermissionsGuard`).
4. `assertOwnerOrAdmin` helper.
5. Wire `APP_GUARD` in `app.module.ts`.
6. Update existing controllers (`@Public()` everywhere except `/auth/me`).
7. Delete `RolesGuard` / `@Roles()` + their tests.
8. Write/update tests.
9. Run `yarn lint && yarn test && yarn test:int`.

**Files worth reading first** (use `deep-explore` per `CLAUDE.md`):

- `packages/backend/src/modules/auth/auth.module.ts` (current provider/export list)
- `packages/backend/src/modules/auth/guards/jwt-auth.guard.ts` (the file you're extending)
- `packages/backend/src/modules/auth/strategies/jwt.strategy.ts` (confirm `req.user` shape)
- `packages/backend/src/app.module.ts` (where APP_GUARD goes)
- `packages/shared/types/src/index.ts` + `user.schema.ts` (confirm role export name)

Do not read more than that before starting. The pattern is small; over-reading wastes context.
