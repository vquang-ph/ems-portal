# Phase 2 Hand-off: User Infrastructure + Provider Profiles (Frontend)

**Date:** 2026-05-25
**Scope:** `packages/shared/types`, `packages/frontend/src/modules/provider-profile/`, `packages/frontend/src/routes/`, `packages/frontend/src/lib/apiClient.ts`, `packages/frontend/src/layouts/RootLayout.tsx`
**Reference:** `docs/product-specs/spec.md`, `docs/product-specs/data-model.md`, `docs/hand-offs/phase-1.md`

---

## What's Built

### Shared Types (`@ems-portal/types`)

**`src/auth/auth.schema.ts`** — `UserSchema` extended with three new fields:
- `status: z.enum(["active", "suspended", "deleted"])` — surfaces admin suspension state in the UI
- `emailVerifiedAt: z.coerce.date().nullable()` — security telemetry
- `lastLoginAt: z.coerce.date().nullable()` — security telemetry

**`src/provider-profile/provider-profile.schema.ts`** — new file with the full profile type surface:

| Schema | Purpose |
|---|---|
| `VerificationStatusSchema` | `unverified \| pending \| verified` |
| `ProficiencyLevelSchema` | `junior \| mid \| senior \| expert` |
| `SkillCategorySchema` | `{ id, name }` — catalog parent |
| `SkillSchema` | `{ id, name, categoryId }` — master catalog |
| `ProviderSkillSchema` | Join row: skillId, level, yearsOfExperience, createdAt |
| `ProviderProfileSchema` | Full profile (extends BaseSchema); includes denormalized rating fields and optional `skills[]` |
| `CreateProviderProfileSchema` | Input for POST — bio, location, rate, availability |
| `UpdateProviderProfileSchema` | Partial of create — used by PATCH |
| `AddProviderSkillSchema` | Input for skill addition: skillId, level, yearsOfExperience |

**`src/index.ts`** — exports all new schemas and inferred types.

---

### New Module: `provider-profile`

Location: `packages/frontend/src/modules/provider-profile/`

Follows the same structure as the `auth` module: `api/` → `cache/` → `hooks/` → `components/` → `pages/` → `test/` → `index.ts`.

#### API (`api/providerProfileApi.ts`)

Wraps `apiClient`. Maps to these backend endpoints:

| Method | Endpoint | Returns |
|---|---|---|
| `GET` | `/provider-profiles/me` | `ProviderProfile` |
| `POST` | `/provider-profiles` | `ProviderProfile` |
| `PATCH` | `/provider-profiles/me` | `ProviderProfile` |
| `GET` | `/provider-profiles/:userId` | `ProviderProfile` (public) |
| `GET` | `/skills/categories` | `SkillCategory[]` |
| `GET` | `/skills?categoryId=` | `Skill[]` |
| `POST` | `/provider-profiles/me/skills` | `ProviderSkill` |
| `DELETE` | `/provider-profiles/me/skills/:skillId` | `void` |

All responses run through `parseObjectWithDates()` to normalize date strings, matching the auth module convention.

#### Cache Keys (`cache/providerProfileKeys.ts`)

```ts
providerProfileKeys.query.me()
providerProfileKeys.query.byUser(userId)
providerProfileKeys.query.categories()
providerProfileKeys.query.skills()       // optionally scoped by categoryId
providerProfileKeys.mutation.create()
providerProfileKeys.mutation.update()
providerProfileKeys.mutation.addSkill()
providerProfileKeys.mutation.removeSkill()
```

#### Queries (`hooks/queries/`)

| Hook | Key behaviour |
|---|---|
| `useMyProfileQuery` | `enabled` only when `currentUserAtom.role === "service_provider"` |
| `useSkillCategoriesQuery` | `staleTime: Infinity` — catalog is effectively static |
| `useSkillsQuery` | Accepts optional `categoryId`; refetches when it changes |
| `useProviderProfileQuery` | Public profile by `userId`; enabled when `userId` is present |

#### Mutations (`hooks/mutations/`)

All four mutations (`useCreateProfileMutation`, `useUpdateProfileMutation`, `useAddSkillMutation`, `useRemoveSkillMutation`) follow the auth mutation pattern:
- `onSuccess` invalidates `providerProfileKeys.query.me()`
- `useCreateProfileMutation` additionally navigates to `/profile` on success

#### Components

| Component | Description |
|---|---|
| `ProfileForm` | react-hook-form + `zodResolver(UpdateProviderProfileSchema)`. Fields: bio (textarea), hourlyRateMin/Max (number), isAvailable (Switch), latitude/longitude (number, optional). Accepts `defaultValues` — shared by both create and update modes. |
| `SkillsManager` | Current skills rendered as removable Badge list. Combobox (shadcn `Command`) for search + select. Proficiency level Select + years Input per addition. |
| `ProfileCard` | Read-only: Avatar, name, bio, rate range, availability Badge, star rating, skills list. |

#### Pages

| Page | Route | Access |
|---|---|---|
| `ProfileSetupPage` | `/profile/setup` | Provider only |
| `ProfileSkillsPage` | `/profile/skills` | Provider only |
| `ProfilePage` | `/profile` | All authenticated users |

`ProfileSetupPage` detects create vs. update mode: if `useMyProfileQuery` returns data, it pre-fills `ProfileForm` and calls the update mutation; otherwise it calls create.

---

### New Routes (`src/routes/`)

| File | Path | Guard |
|---|---|---|
| `_app.profile.tsx` | `/profile` (layout) | Auth only (inherits from `_app`) |
| `_app.profile.index.tsx` | `/profile` | Any authenticated user; reads `?userId` search param, falls back to own id |
| `_app.profile.setup.tsx` | `/profile/setup` | `beforeLoad`: role ≠ `service_provider` → redirect `/` |
| `_app.profile.skills.tsx` | `/profile/skills` | `beforeLoad`: role ≠ `service_provider` → redirect `/` |

Role guard pattern (mirrors the auth guard in `_app.tsx`):

```ts
beforeLoad: () => {
  const user = jotaiStore.get(currentUserAtom)
  if (user?.role !== "service_provider") {
    throw redirect({ to: "/" })
  }
}
```

---

### API Client Update (`src/lib/apiClient.ts`)

Added 403 branch to the response interceptor, distinct from the 401/token-refresh path:

```ts
if (error.response?.status === 403) {
  // Session is valid — user is authenticated but not authorized for this action.
  // Surface error to the caller; do not clear session or trigger refresh.
  return Promise.reject(error)
}
```

Callers (mutations/queries) surface this to the UI via TanStack Query's `error` state.

---

### Navigation (`src/layouts/RootLayout.tsx`)

Header now renders role-conditional links using `currentUserAtom`:

- `service_provider`: **My Profile** (`/profile`) + **Skills** (`/profile/skills`)
- `client`: no new links in Phase 2 (gains "Post Request" in Phase 3)
- All roles: existing links unchanged

---

## Gap Analysis vs Data Model

| Data Model Field / Entity | Status |
|---|---|
| `users.status` (active/suspended/deleted) | ✅ Added to `UserSchema`; surfaced in UI where relevant |
| `users.email_verified_at` | ✅ Added to `UserSchema` |
| `users.last_login_at` | ✅ Added to `UserSchema` |
| `provider_profiles` | ✅ Full CRUD via `provider-profile` module |
| `skill_categories` + `skills` catalog | ✅ Fetched and used in `SkillsManager` |
| `provider_skills` (join) | ✅ Add/remove via `useAddSkillMutation` / `useRemoveSkillMutation` |
| `users.deleted_at` (soft delete) | ⚠️ Backend field exists; frontend has no delete-account flow yet |
| `provider_profiles.verification_status` | ⚠️ Displayed read-only in `ProfileCard`; no verification workflow UI |
| `RolesGuard` enforcement on backend | ⚠️ Frontend handles 403 defensively; verify backend wires guard globally |

---

## Natural Next Steps

1. **Phase 3 — Service Requests:** Clients can create requests (`/requests/new`), view their list (`/requests`), and see detail (`/requests/:id`). Backend: `service_requests` module with full state machine.
2. **Email verification flow** (medium priority from Phase 1 backlog): now that `emailVerifiedAt` is in the shared type, the verification banner and flow can be added.
3. **Account deletion UI** — soft-delete endpoint + confirmation dialog.

---

## Verification

```bash
# 1. Rebuild shared types
yarn build:types

# 2. Frontend unit tests
yarn workspace @ems-portal/frontend test

# 3. Full stack smoke test
yarn dev
# → Log in as service_provider
# → /profile/setup: fill and submit form
# → /profile: confirm ProfileCard renders
# → /profile/skills: add a skill, confirm badge appears, remove it
# → Log in as client
# → Navigate to /profile/setup → should redirect to /
```
