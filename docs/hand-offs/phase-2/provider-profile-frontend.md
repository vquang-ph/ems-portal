# Phase 2 Hand-off: Provider Profile — Frontend

**Date:** 2026-05-25
**Scope:** `packages/shared/types`, `packages/frontend/src/modules/provider-profile/`, `packages/frontend/src/routes/`, `packages/frontend/src/lib/apiClient.ts`, `packages/frontend/src/layouts/RootLayout.tsx`
**Reference:** `docs/product-specs/data-model.md`, `docs/hand-offs/phase-2/provider-profile-backend.md`

---

## API Contract (from Backend)

The frontend is built against these endpoints. Both agents work in parallel — this table is the shared contract.

| Method | Path | Auth / Permission | Request Body | Returns |
|---|---|---|---|---|
| `GET` | `/skills/categories` | Public | — | `SkillCategory[]` |
| `GET` | `/skills?categoryId=` | Public | — | `Skill[]` |
| `POST` | `/provider-profiles` | JWT + `provider_profile:create:own` | `CreateProviderProfile` | `ProviderProfile` (201) |
| `GET` | `/provider-profiles/me` | JWT only | — | `ProviderProfile` (with `skills[]`) |
| `PATCH` | `/provider-profiles/me` | JWT + `provider_profile:update:own` | `UpdateProviderProfile` | `ProviderProfile` |
| `GET` | `/provider-profiles/:userId` | JWT + `provider_profile:read:any` | — | `ProviderProfile` (with `skills[]`) |
| `POST` | `/provider-profiles/me/skills` | JWT + `provider_profile:update:own` | `AddProviderSkill` | `ProviderSkill` (201) |
| `DELETE` | `/provider-profiles/me/skills/:skillId` | JWT + `provider_profile:update:own` | — | *(empty, 204)* |

**403 behaviour:** Clients calling `POST /provider-profiles` or `PATCH /provider-profiles/me` receive 403. Providers calling `GET /provider-profiles/:userId` (another user) receive 403 — they use `/me` instead.

---

## What's Built

### Shared Types (`@ems-portal/types`)

**`src/auth/auth.schema.ts`** — `UserSchema` extended:
- `status: z.enum(["active", "suspended", "deleted"]).optional()`
- `emailVerifiedAt: z.coerce.date().nullable().optional()`
- `lastLoginAt: z.coerce.date().nullable().optional()`

**`src/provider-profile/provider-profile.schema.ts`** — new file:

| Schema | Purpose |
|---|---|
| `VerificationStatusSchema` | `unverified \| pending \| verified` |
| `ProficiencyLevelSchema` | `junior \| mid \| senior \| expert` |
| `SkillCategorySchema` | `{ id: number, name: string }` |
| `SkillSchema` | `{ id: number, name: string, categoryId: number }` |
| `ProviderSkillSchema` | `{ skillId, level, yearsOfExperience, createdAt }` |
| `ProviderProfileSchema` | Full profile (extends `BaseSchema`); includes denormalized rating fields + optional `skills[]` |
| `CreateProviderProfileSchema` | Input for `POST` — bio, location, rate, availability |
| `UpdateProviderProfileSchema` | Alias of `CreateProviderProfileSchema` (all fields optional) |
| `AddProviderSkillSchema` | `{ skillId, level, yearsOfExperience }` |

**`src/index.ts`** — exports all new schemas and inferred types.

---

### New Module: `provider-profile`

Location: `packages/frontend/src/modules/provider-profile/`

Follows the `auth` module structure: `api/` → `cache/` → `hooks/` → `components/` → `pages/` → `test/` → `index.ts`.

#### API (`api/providerProfileApi.ts`)

```ts
const providerProfileApi = {
  getMyProfile(): Promise<ProviderProfile>        // GET /provider-profiles/me
  createProfile(body: CreateProviderProfile): Promise<ProviderProfile>
  updateMyProfile(body: UpdateProviderProfile): Promise<ProviderProfile>
  getProfileByUserId(userId: string): Promise<ProviderProfile>
  getSkillCategories(): Promise<SkillCategory[]>  // GET /skills/categories
  getSkills(categoryId?: number): Promise<Skill[]>
  addSkill(body: AddProviderSkill): Promise<ProviderSkill>
  removeSkill(skillId: number): Promise<void>
}
```

All responses run through `parseObjectWithDates()` matching the `authApi` convention.

#### Cache Keys (`cache/providerProfileKeys.ts`)

```ts
providerProfileKeys.query.me()
providerProfileKeys.query.byUser(userId)
providerProfileKeys.query.categories()
providerProfileKeys.query.skills(categoryId?)
providerProfileKeys.mutation.create()
providerProfileKeys.mutation.update()
providerProfileKeys.mutation.addSkill()
providerProfileKeys.mutation.removeSkill()
```

#### Queries (`hooks/queries/`)

| Hook | File | Behaviour |
|---|---|---|
| `useMyProfileQuery` | `useMyProfileQuery.ts` | `enabled` only when `currentUserAtom.role === "service_provider"` |
| `useProviderProfileQuery` | `useProviderProfileQuery.ts` | Enabled when `userId` is defined; used for public profile view |
| `useSkillCategoriesQuery` | `useSkillCategoriesQuery.ts` | `staleTime: Infinity` — catalog rarely changes |
| `useSkillsQuery` | `useSkillsQuery.ts` | Accepts optional `categoryId`; re-fetches when it changes |

#### Mutations (`hooks/mutations/`)

| Hook | File | `onSuccess` behaviour |
|---|---|---|
| `useCreateProfileMutation` | `useCreateProfileMutation.ts` | Invalidates `query.me()`, navigate to `/profile` |
| `useUpdateProfileMutation` | `useUpdateProfileMutation.ts` | Invalidates `query.me()` |
| `useAddSkillMutation` | `useAddSkillMutation.ts` | Invalidates `query.me()` |
| `useRemoveSkillMutation` | `useRemoveSkillMutation.ts` | Invalidates `query.me()` |

All four follow the auth mutation shape: `useMutation({ mutationKey, mutationFn, onSuccess })`.

#### Components

| Component | File | Description |
|---|---|---|
| `ProfileForm` | `ProfileForm.tsx` | `react-hook-form` + `zodResolver(UpdateProviderProfileSchema)`. Fields: bio (Textarea), hourlyRateMin/Max (Input, type number), isAvailable (Switch), latitude/longitude (Input, type number, optional). Accepts `defaultValues` prop — shared by create and update modes. |
| `SkillsManager` | `SkillsManager.tsx` | Current skills as removable Badge list. Combobox (shadcn `Command`) to search/select. Proficiency level Select + years Input per addition. Calls `useAddSkillMutation` / `useRemoveSkillMutation` inline. |
| `ProfileCard` | `ProfileCard.tsx` | Read-only: Avatar, name, bio, rate range, availability Badge, star rating display, skills list. |

#### Pages

| Page | File | Route | Access |
|---|---|---|---|
| `ProfileSetupPage` | `ProfileSetupPage.tsx` | `/profile/setup` | Provider only |
| `ProfileSkillsPage` | `ProfileSkillsPage.tsx` | `/profile/skills` | Provider only |
| `ProfilePage` | `ProfilePage.tsx` | `/profile` | All authenticated users |

`ProfileSetupPage` detects mode: if `useMyProfileQuery` returns data → pre-fill `ProfileForm` and call `useUpdateProfileMutation`; else → call `useCreateProfileMutation`.

#### Test files

| File | Contents |
|---|---|
| `test/fixtures.ts` | Mock `ProviderProfile`, `Skill[]`, `SkillCategory[]` objects |
| `test/testIds.ts` | `PROVIDER_PROFILE_TEST_IDS` constants |
| `test/index.ts` | Barrel re-export |

#### Barrel (`index.ts`)

Exports pages, hooks (queries + mutations), and components for consumption by routes.

---

### New Routes (`src/routes/`)

Follows TanStack Router file-based naming. All routes sit under the existing `_app` auth guard.

| File | Path | Guard |
|---|---|---|
| `_app.profile.tsx` | `/profile` (layout) | Auth only (inherits from `_app`) |
| `_app.profile.index.tsx` | `/profile` | Any authenticated user; reads `?userId` search param, falls back to own id |
| `_app.profile.setup.tsx` | `/profile/setup` | `beforeLoad`: role ≠ `service_provider` → redirect `/` |
| `_app.profile.skills.tsx` | `/profile/skills` | `beforeLoad`: role ≠ `service_provider` → redirect `/` |

Role guard pattern — mirrors `_app.tsx`:

```ts
beforeLoad: () => {
  const user = jotaiStore.get(currentUserAtom);
  if (user?.role !== "service_provider") {
    throw redirect({ to: "/" });
  }
},
```

---

### API Client Update (`src/lib/apiClient.ts`)

Add 403 branch to the response interceptor, distinct from the 401/token-refresh path:

```ts
if (error.response?.status === 403) {
  // User is authenticated but not authorized. Do NOT clear session.
  return Promise.reject(error);
}
```

This surfaces to callers via TanStack Query's `error` state. Components render an inline error message rather than a redirect.

---

### Navigation (`src/layouts/RootLayout.tsx`)

Role-conditional header links using `currentUserAtom`:

- `service_provider`: **My Profile** (`/profile`) + **Skills** (`/profile/skills`)
- `client`: no new links in Phase 2
- All roles: existing links unchanged

---

## Gap Analysis vs Data Model

| Data Model Field / Entity | Status |
|---|---|
| `users.status` | ✅ Added to `UserSchema`; displayable in UI (e.g. suspended badge) |
| `users.email_verified_at` | ✅ Added to `UserSchema` |
| `users.last_login_at` | ✅ Added to `UserSchema` |
| `provider_profiles` | ✅ Full CRUD via `provider-profile` module |
| `skill_categories` + `skills` catalog | ✅ Fetched and used in `SkillsManager` |
| `provider_skills` (add/remove) | ✅ `useAddSkillMutation` / `useRemoveSkillMutation` |
| `users.deleted_at` (soft delete) | ⚠️ Backend field exists; no delete-account flow in frontend yet |
| `provider_profiles.verification_status` | ⚠️ Displayed read-only in `ProfileCard`; no verification workflow UI |
| `GET /provider-profiles/:userId` for providers | ⚠️ Providers lack `provider_profile:read:any` — they use `/me` only; coordinate with backend if cross-provider reads are needed |

---

## Tests

**Unit tests (`*.test.tsx`, co-located in `test/`):**
- `useMyProfileQuery.test.ts` — mock `apiClient`; assert `enabled: false` when role is `client`
- `useCreateProfileMutation.test.ts` — mock `apiClient`; assert `query.me()` is invalidated on success
- `ProfileForm.test.tsx` — render, fill all fields, submit; assert mutation called with correct payload
- `SkillsManager.test.tsx` — render with existing skills; click remove badge → assert `useRemoveSkillMutation` called; select skill from combobox + submit → assert `useAddSkillMutation` called

**Route guard tests:**
- `_app.profile.setup` — render with `role = "client"` → assert redirect to `/`
- `_app.profile.skills` — same guard assertion

---

## Verification

```bash
# 1. Rebuild shared types (after backend adds new schemas)
yarn build:types

# 2. Frontend unit tests
yarn workspace @ems-portal/frontend test

# 3. Full stack smoke test (requires backend Phase 2 complete)
yarn dev
# → Log in as provider@ems.local
# → /profile/setup: fill and submit → assert profile appears at /profile
# → /profile/skills: add a skill → badge appears; remove it → badge gone
# → Log in as client@ems.local
# → Navigate to /profile/setup → assert redirect to /
# → Navigate to /profile?userId=<provider-uuid> → assert ProfileCard renders
```
