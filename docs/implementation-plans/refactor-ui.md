# UI Refactor — Production-Ready Shell + Foundation for Future Roles

## Context

Today's UI (home dashboard, profile, manage skills, login/register) renders as plain white pages with a single-row text header. Functionally complete, visually unfinished. The user wants:

1. A **production-grade visual baseline** across every screen built so far.
2. A **layout shell that will scale** to upcoming roles/features without another rewrite: client browse/search, admin panel, bookings/engagements, notifications + messaging.
3. A **dedicated implementation doc** (this file) that the next session can execute against verbatim.

The foundations are healthier than the screens suggest:

- Tailwind v4 + OKLCH design tokens already in `packages/frontend/src/index.css` (light + dark wired, sidebar tokens defined but unused).
- All 56 shadcn primitives are already installed under `packages/frontend/src/components/ui/` — including `sidebar.tsx`, `breadcrumb.tsx`, `dropdown-menu.tsx`, `skeleton.tsx`, `spinner.tsx`, `empty.tsx`, `avatar.tsx`, `tooltip.tsx`. We just don't use most of them yet.
- Session/role state already lives in `src/modules/auth/store/sessionAtom.ts` and is consumed via `useSession()`.
- File-based routing under `src/routes/_authenticated/_app/*` with `beforeLoad` role gates is the right primitive for the future portals.

So this refactor is mostly **composition + extraction**, not new dependencies. No new libraries; no design-token rework; no migration of existing data flows.

## Goals & Non-Goals

**Goals**

- Replace `RootLayout` with a sidebar + topbar shell that is role-aware, responsive, and ready for ≥4 more sections.
- Polish every authenticated page that already exists (home, profile view, profile setup, manage skills).
- Redesign the unauthenticated screens (login, register) onto a shared `AuthLayout`.
- Add reusable building blocks (`PageHeader`, `StatCard`, `EmptyState`, `LoadingState`, `RoleBadge`) so future features inherit the look automatically.
- Reserve nav slots and route placeholders for: `/providers` (client), `/admin/*` (admin), `/bookings` (both), `/messages` + notifications bell (both) — **placeholders only, no real screens**.

**Non-goals**

- Dark mode toggle (CSS is wired, but no UI toggle this pass — explicit user decision).
- New design-token system, new icon library beyond `lucide-react` (already pulled in by shadcn).
- Backend changes. No new endpoints; no schema changes.
- Real implementations of the placeholder sections (providers/admin/bookings/messages).
- Any change to TanStack Query keys, Jotai atoms, or routing semantics beyond adding placeholder routes.

## Layout shell — target structure

```
┌─ Sidebar ───────────┬─ Topbar ────────────────────────────┐
│ EMS Portal     [▾]  │  Profile › Skills        🔔  [👤▾]  │
├─────────────────────┼─────────────────────────────────────┤
│ ⌂ Dashboard         │                                     │
│ ◐ My Profile *      │  <PageHeader title actions>         │
│ ✦ Skills    *       │  <page content>                     │
│ 🔍 Find providers † │                                     │
│ 📅 Bookings         │                                     │
│ 💬 Messages         │                                     │
│ ─── Admin ─────  ‡  │                                     │
│ 👥 Users         ‡  │                                     │
│ 🏷 Skills taxonomy‡ │                                     │
│ ✓ Verification   ‡  │                                     │
│                     │                                     │
│ ⚙ Settings          │                                     │
└─────────────────────┴─────────────────────────────────────┘
  * ServiceProvider only · † Client only · ‡ Admin only
```

- **Sidebar**: shadcn `Sidebar` primitive (`components/ui/sidebar.tsx`) in `collapsible="icon"` mode. Collapses to a rail on desktop, becomes a `Sheet`-style drawer on `<md` automatically (the shadcn component handles this).
- **Topbar**: ~56px row containing `SidebarTrigger`, breadcrumbs (derived from current route), a notifications bell (placeholder button, no popover yet), and the user `DropdownMenu` (name, role badge, "Settings", "Log out").
- **Active route highlighting**: driven by TanStack Router's `useMatchRoute` / `Link`'s `activeProps`.

## Information architecture / nav config

A single declarative nav config drives both the sidebar and any future command palette. **Roles map to visible items via filter, not duplicated trees.**

`src/app/navigation/navConfig.ts` (new):

```ts
export type NavItem = {
  key: string;
  label: string;
  to: string; // typed via TanStack Router's FileRoutesByPath
  icon: LucideIcon;
  roles: UserRole[]; // empty array = visible to all authenticated users
  group?: "main" | "admin";
  badge?: () => string | number | null; // future: unread counts
};
```

Items shipped (with `roles` filter — empty = everyone authenticated):

| key            | label           | to                    | roles                       | group                |
| -------------- | --------------- | --------------------- | --------------------------- | -------------------- |
| `home`         | Dashboard       | `/`                   | `[]`                        | main                 |
| `profile`      | My Profile      | `/profile`            | `[ServiceProvider]`         | main                 |
| `skills`       | Skills          | `/profile/skills`     | `[ServiceProvider]`         | main                 |
| `providers`    | Find providers  | `/providers`          | `[Client]`                  | main                 |
| `bookings`     | Bookings        | `/bookings`           | `[Client, ServiceProvider]` | main                 |
| `messages`     | Messages        | `/messages`           | `[]`                        | main                 |
| `admin-users`  | Users           | `/admin/users`        | `[Admin]`                   | admin                |
| `admin-skills` | Skills taxonomy | `/admin/skills`       | `[Admin]`                   | admin                |
| `admin-verify` | Verification    | `/admin/verification` | `[Admin]`                   | admin                |
| `settings`     | Settings        | `/settings`           | `[]`                        | main (pinned bottom) |

Placeholders for `/providers`, `/bookings`, `/messages`, `/admin/*`, `/settings`: each is a new file under `src/routes/_authenticated/_app/...` exporting a route whose component renders `<EmptyState>` (see component inventory). `beforeLoad` enforces the role gate using the same pattern as the existing `profile/skills.tsx`.

## New / refactored components

All under `packages/frontend/src/`.

### `app/layout/` (new folder)

- **`AppShell.tsx`** — top-level. Renders `<SidebarProvider><AppSidebar /><SidebarInset><Topbar /><Outlet /></SidebarInset></SidebarProvider>`. Replaces today's `RootLayout`.
- **`AppSidebar.tsx`** — reads `navConfig`, filters by `useSession().user.role`, splits into `main` + `admin` groups, renders shadcn `SidebarMenu` items.
- **`Topbar.tsx`** — breadcrumbs (from `useMatches`), notifications bell button (disabled tooltip "Coming soon"), `UserMenu`.
- **`UserMenu.tsx`** — shadcn `DropdownMenu`. Avatar + name + role badge trigger; menu items: Settings, Log out.
- **`Breadcrumbs.tsx`** — small helper that maps active matches to breadcrumb items. Each route exports an optional `staticData: { breadcrumb: "Skills" }` (TanStack Router pattern).

### `layouts/AuthLayout.tsx` (new)

Two-column on `≥md` (brand panel left, form panel right), single-column below. Replaces the bare `Card` wrappers currently on `login.tsx` / `register.tsx`. Brand panel: app name + a short value-prop line + a subtle gradient using existing tokens. Form panel: centered `Card` with form, footer link to the other auth page.

### `components/common/` (new folder for shared, non-shadcn primitives)

- **`PageHeader.tsx`** — `{ title, description?, actions? }`. Standard top-of-page bar. Used by every page so spacing/typography stay consistent.
- **`StatCard.tsx`** — `{ label, value, icon?, trend?, hint? }`. Card with big number; used on the new dashboard and reserved for future dashboards.
- **`EmptyState.tsx`** — thin wrapper over shadcn `empty.tsx` with `{ icon, title, description, action? }`. Use for placeholder routes and "no data" states.
- **`LoadingState.tsx`** — replaces ad-hoc "Loading…" text. Renders `Skeleton` rows sized for the parent context, or a centered `Spinner` for full-page.
- **`RoleBadge.tsx`** — `Badge` variant per role (Client / ServiceProvider / Admin), with role label formatting (replaces inline `.replace(/_/g, " ")`).

### Refactored pages

- **`AppHomePage`** (`src/modules/auth/pages/AppHomePage.tsx`): becomes a role-aware dashboard.
  - ServiceProvider: greeting + StatCards for `Profile completeness`, `Skills count`, `Visibility (Available/Unavailable)`. CTA card linking to `/profile` and `/profile/skills`. Real values where data already exists (skills count from existing query); placeholders where it doesn't.
  - Client: greeting + StatCards (`Saved providers`, `Active bookings`, `Messages`) — all `EmptyState` placeholders pointing at `/providers`.
  - Admin: greeting + StatCards (`Pending verifications`, `Total users`, `Skill submissions`) — placeholders.
- **`ProfilePage`**: wrap content with `PageHeader` ("My Profile" + "Edit profile" / "Manage skills" action buttons moved into header); turn the body into a 2-column grid on `lg+` (identity + rate on the left, skills on the right); replace the "0.0 (0)" inline rating with a small `Rating` block using `lucide-react` star icons; replace text "Loading…" with `LoadingState`.
- **`ProfileSetupPage`**: keep the form fields, regroup into `Card`s ("Public identity", "Rate", "Availability"), add `FieldDescription` help text under each field, add a sticky footer with Save/Cancel.
- **`ProfileSkillsPage` / `SkillsManager`**: split "Current skills" and "Add a skill" into two stacked `Card`s with clearer separators; replace `×` button with `lucide-react` `X` icon inside a shadcn `Button size="icon" variant="ghost"`; show empty state when no skills; disable Add button with a tooltip explaining why when fields are missing.
- **`LoginPage` / `RegisterPage`**: drop into `AuthLayout`; keep existing form fields and Zod validation; add inline error alerts using shadcn `Alert`.

## Routing changes

New placeholder route files (each one is ~15 lines, renders `<EmptyState>`):

- `src/routes/_authenticated/_app/providers/index.tsx` — `beforeLoad`: redirect non-Client roles to `/`.
- `src/routes/_authenticated/_app/bookings/index.tsx` — `beforeLoad`: allow Client + ServiceProvider.
- `src/routes/_authenticated/_app/messages/index.tsx` — no role gate.
- `src/routes/_authenticated/_app/settings/index.tsx` — no role gate.
- `src/routes/_authenticated/_app/admin.tsx` — pathless layout for the admin section, `beforeLoad`: Admin only.
- `src/routes/_authenticated/_app/admin/users.tsx`, `admin/skills.tsx`, `admin/verification.tsx` — leaves.

Add `staticData: { breadcrumb: "..." }` to every existing route + every new placeholder so `Breadcrumbs.tsx` has labels.

`RootLayout.tsx` is **deleted**; `__root.tsx` keeps just the providers; `_app.tsx` mounts `<AppShell />`.

## Visual / token decisions

- **Sidebar width**: shadcn defaults (16rem expanded, 3rem collapsed) — fine, no override.
- **Page max-width**: `max-w-6xl mx-auto` on the inner content wrapper of `SidebarInset`; full-bleed only for dashboards.
- **Vertical rhythm**: `space-y-6` between page sections; `gap-4` inside cards.
- **Color usage**: reuse existing `--primary`, `--muted-foreground`, `--border`. **Do not add new tokens.** If a screen needs a status color, use `--destructive` or an existing chart token, not a new variable.
- **Icons**: `lucide-react` only. Standard set chosen so the same icon means the same thing everywhere: `Home`, `User`, `Sparkles` (Skills), `Search` (Find providers), `Calendar` (Bookings), `MessageSquare` (Messages), `Shield` (Admin section), `Users`, `Tag`, `BadgeCheck`, `Settings`, `Bell`, `LogOut`.

## Reusable patterns to enforce (codify in `packages/frontend/README.md`)

1. **Every page renders `<PageHeader>` first.** No raw `<h1>` in pages.
2. **Loading is always `<LoadingState />`,** never inline "Loading…".
3. **Empty is always `<EmptyState />`,** never raw text.
4. **A new nav item is one entry in `navConfig.ts` + one route file.** No edits to `AppSidebar.tsx` for new routes.
5. **Role gating lives in `beforeLoad`,** not in components. Components assume the right role is present.
6. **Role labels come from `<RoleBadge />` or its formatter.** No more `role.replace(/_/g, " ")` scattered in JSX.

## Implementation steps (sequenced)

1. **Scaffolding**: create `app/layout/`, `app/navigation/navConfig.ts`, `components/common/`, `layouts/AuthLayout.tsx`. No behavior changes yet — empty shells with TODO bodies.
2. **`navConfig.ts` + `AppSidebar.tsx`**: wire role-filtered menu against `useSession()`. Verify visible items per role with the existing seeded users.
3. **`AppShell.tsx` + `Topbar.tsx` + `UserMenu.tsx` + `Breadcrumbs.tsx`**: replace `RootLayout` import in `_app.tsx`. Delete `RootLayout.tsx`.
4. **Common components**: `PageHeader`, `StatCard`, `EmptyState`, `LoadingState`, `RoleBadge`. Each gets a small test under `components/common/test/`.
5. **Placeholder routes**: add `/providers`, `/bookings`, `/messages`, `/settings`, `/admin/*` with `beforeLoad` role guards and `<EmptyState>` bodies. Add `staticData.breadcrumb` to every route.
6. **Refactor `AppHomePage`** into the role-aware dashboard described above; reuse the existing provider-profile query for the ServiceProvider stats.
7. **Refactor `ProfilePage`, `ProfileSetupPage`, `ProfileSkillsPage`** to use `PageHeader` + new common components + grouped Cards. No data-layer changes.
8. **`AuthLayout` + login/register** redesign. Keep all form/Zod logic intact.
9. **Update `packages/frontend/README.md`** with the new "Layout shell + page conventions" section pointing back at this doc.

Each step is a self-contained commit; the shell can land before the page polish without breaking anything (`PageHeader`/`EmptyState` etc. are additive).

## Critical files

**Will be created**

- `packages/frontend/src/app/layout/AppShell.tsx`
- `packages/frontend/src/app/layout/AppSidebar.tsx`
- `packages/frontend/src/app/layout/Topbar.tsx`
- `packages/frontend/src/app/layout/UserMenu.tsx`
- `packages/frontend/src/app/layout/Breadcrumbs.tsx`
- `packages/frontend/src/app/navigation/navConfig.ts`
- `packages/frontend/src/components/common/{PageHeader,StatCard,EmptyState,LoadingState,RoleBadge}.tsx`
- `packages/frontend/src/layouts/AuthLayout.tsx`
- 7 new route files under `src/routes/_authenticated/_app/` (placeholders)

**Will be modified**

- `packages/frontend/src/routes/__root.tsx` (drop layout responsibility)
- `packages/frontend/src/routes/_authenticated/_app.tsx` (mount `AppShell`)
- `packages/frontend/src/routes/_anonymous/{login,register}.tsx` (wrap in `AuthLayout`)
- `packages/frontend/src/modules/auth/pages/AppHomePage.tsx` (role-aware dashboard)
- `packages/frontend/src/modules/provider-profile/pages/{ProfilePage,ProfileSetupPage,ProfileSkillsPage}.tsx`
- `packages/frontend/src/modules/provider-profile/components/{ProfileCard,ProfileForm,SkillsManager}.tsx` (visual only; data layer untouched)
- Add `staticData: { breadcrumb }` to every existing route file.
- `packages/frontend/README.md` (new conventions section).

**Will be deleted**

- `packages/frontend/src/layouts/RootLayout.tsx` (replaced by `AppShell`)

## Reuse — what already exists, don't rebuild

- Sidebar primitive: `packages/frontend/src/components/ui/sidebar.tsx` (provides `SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarMenu*`, `SidebarInset`, mobile drawer behavior).
- Breadcrumb primitive: `components/ui/breadcrumb.tsx`.
- Dropdown menu: `components/ui/dropdown-menu.tsx` (used by `UserMenu`).
- Empty state primitive: `components/ui/empty.tsx` (wrapped by our `EmptyState`).
- Skeleton + Spinner: `components/ui/{skeleton,spinner}.tsx` (used by `LoadingState`).
- Session/role hook: `useSession()` in `src/modules/auth/hooks/useSession.ts` — sole source of role; do not re-read the atom in components.
- Existing query for provider profile (used today by `ProfilePage`) — reuse on the new dashboard's ServiceProvider tile.

## Verification

When the implementation lands, verify by:

1. `yarn workspace @ems-portal/frontend dev` — load `/` as each seeded role:
   - **ServiceProvider** sees Dashboard, My Profile, Skills, Bookings, Messages, Settings — no Find Providers, no Admin.
   - **Client** sees Dashboard, Find Providers, Bookings, Messages, Settings — no My Profile/Skills, no Admin.
   - **Admin** sees Dashboard, Bookings, Messages, Admin group (Users / Skills taxonomy / Verification), Settings.
2. Resize to `<md` — sidebar collapses to a drawer, `SidebarTrigger` opens it.
3. Direct-navigate to a role-gated route (e.g. `/admin/users` as a Client) — `beforeLoad` redirects to `/`.
4. Breadcrumbs update on every navigation; the last segment matches each route's `staticData.breadcrumb`.
5. Every existing page still works: profile view, profile setup save, skill add/remove, login, register, logout. No regression in TanStack Query cache behavior.
6. `yarn workspace @ems-portal/frontend test` passes; new common components have basic render tests.
7. `yarn lint` clean (no `any`, no unused vars).
8. Take fresh screenshots of `/`, `/profile`, `/profile/skills`, `/login` as each role and confirm visual parity with this plan.
