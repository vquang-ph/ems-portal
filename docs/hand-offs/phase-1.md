# Phase 1 Handoff: Auth & User Modules

**Date:** 2026-05-25
**Scope:** `packages/backend/src/modules/user/` and `packages/backend/src/modules/auth/`
**Reference:** `docs/product-specs/spec.md`, `docs/product-specs/data-model.md`

---

## What's Built

### User Module — thin identity layer

The `UserEntity` covers the essentials: `id` (UUID), `email` (unique, indexed), `name`, `role` (enum: `client | service_provider | admin`), and `passwordHash`, plus `createdAt`/`updatedAt` inherited from `BaseEntity`.

- **Repository**: Custom `findByEmail()` with case-insensitive normalization (lowercases before querying).
- **Service**: 4 public methods — `findByEmail`, `findById`, `createUser` (bcrypt 10 rounds, email lowercased on write), `verifyPassword`.
- **Tests**: Full unit coverage on all 4 service methods and the repository custom query.

### Auth Module — production-grade session management

Five endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`.

- **Access token**: Short-lived (1h), HS256 JWT, bearer extraction via Passport.
- **Refresh token**: Long-lived (7d), SHA256-hashed in DB, delivered via httpOnly cookie (`ems.refresh`). Implements **family-based rotation with reuse detection** — replaying a revoked token revokes the entire family, signaling potential theft.
- **Guards**: `JwtAuthGuard` is active on protected routes. `RolesGuard` exists but is not wired globally yet.
- **Decorators**: `@CurrentUser()` extracts the authenticated user from the request; `@Roles()` sets metadata for future RBAC enforcement.
- **DTOs**: All shapes derived from Zod schemas in `@ems-portal/types` (`LoginSchema`, `RegisterSchema`, `AuthResponseSchema`, `UserSchema`).
- **Tests**: Strong coverage — unit tests for service and controller, integration tests for register/login round-trips against a real DB.

---

## Gap Analysis vs. Data Model

| Data Model Field                                 | Status                                                         |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `users.role` (client / service_provider / admin) | ✅ Implemented                                                 |
| `users.status` (active / suspended / deleted)    | ❌ Missing — admins have no lever to suspend accounts          |
| `users.deleted_at` (soft delete)                 | ❌ Missing — hard delete would corrupt provider rating history |
| `users.email_verified_at`                        | ❌ Missing                                                     |
| `users.last_login_at`                            | ❌ Missing                                                     |
| `refresh_tokens.family_id`                       | ✅ Implemented                                                 |
| `refresh_tokens.token_hash` (sha256)             | ✅ Implemented                                                 |
| `refresh_tokens.replaced_by_token_id`            | ✅ Implemented                                                 |
| `refresh_tokens.revoked_at`                      | ✅ Implemented                                                 |
| `RolesGuard` enforced globally                   | ⚠️ Exists, not wired — RBAC is a core spec §3 requirement      |
| `provider_profiles` table                        | ❌ Not started                                                 |

---

## Key Gaps by Priority

**High — spec / data model requirements:**

1. `users.status` — no account suspension; permanent deletion corrupts rating aggregates (see data-model §3.1).
2. `users.deleted_at` — soft delete is required before any user-facing delete action is exposed.
3. `users.email_verified_at` / `last_login_at` — security telemetry missing from the entity.
4. `RolesGuard` not globally active — RBAC exists in code but enforces nothing yet.
5. `provider_profiles` — prerequisite for the matching engine (supplies 4 of 5 matching criteria).

**Medium — spec §4 / operational:** 6. No password reset / forgot-password flow. 7. No email verification flow. 8. No audit log for admin actions (suspensions, role changes). 9. No paginated `findAll()` for the admin user-management view.

**Low / future:** 10. No 2FA/MFA. 11. Admin role promotion via API (currently seed-only).

---

## Natural Next Steps

1. **Migrate `users`** — add `status`, `deleted_at`, `email_verified_at`, `last_login_at` columns.
2. **Wire `RolesGuard` globally** — start locking endpoints by role (RBAC is a core spec requirement).
3. **Build `provider_profiles`** — unlocks 4 of the 5 matching criteria and is a prerequisite for the matching engine.

The core auth plumbing is solid and won't need to be revisited for any of these steps.
