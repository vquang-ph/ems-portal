# Product Roadmap Overview

**Reference:** `docs/product-specs/spec.md`, `docs/product-specs/data-model.md`, `docs/hand-offs/phase-1.md`

---

## Current State

Phase 1 delivered auth + bare user identity. The gaps to close before any feature work: wire `RolesGuard` globally, add `users.status` / `deleted_at` / `email_verified_at` / `last_login_at`, and build `provider_profiles` (blocks the matching engine).

---

## Phase 2 — User Infrastructure + Provider Profiles

**Goal:** Close all Phase 1 gaps and give providers a complete profile that feeds 4 of the 5 matching criteria.

**Backend:**
- Migrate `users` — add `status`, `deleted_at`, `email_verified_at`, `last_login_at`
- Wire `RolesGuard` globally; lock all existing endpoints by role
- `provider_profiles` module (profile CRUD, is_available, hourly_rate, lat/lng, denormalized rating fields)
- `skill_categories` + `skills` catalog (seeded with Network / Software categories)
- `provider_skills` join table (proficiency level, years_of_experience)

**Frontend pages:**
- `/profile/setup` — provider onboarding (bio, location, rate, availability)
- `/profile/skills` — add/remove skills with proficiency level
- `/profile` — read-only public view

---

## Phase 3 — Service Requests

**Goal:** Enable clients to post jobs, driving the matching trigger.

**Backend:**
- `service_requests` module — full CRUD, status state machine (`open → matched → in_progress → completed → cancelled → expired`)
- Role enforcement: only `client` can create; only `admin` can expire
- Paginated list endpoints (`open` requests, `my requests`)

**Frontend pages:**
- `/requests/new` — create request (title, budget, location, deadline, required skills)
- `/requests` — client's request list with status badges
- `/requests/:id` — request detail + status timeline

---

## Phase 4 — Matching Engine

**Goal:** Implement the core product differentiator — weighted multi-criteria scoring.

**Backend:**
- `matching_configs` — seed `basic-v1` (equal weights) and `intelligent-v1` (tuned weights)
- Matching service — haversine proximity, skill overlap score, cost overlap score, availability flag, rating normalisation → `Score = Σ(wᵢ · cᵢ)`
- `match_results` — audit-log insert for every (request, candidate, config) triple; unique constraint `(request_id, provider_id, config_id)`
- Endpoint: `POST /service-requests/:id/match` — triggers scoring, returns top-N ranked providers

**Frontend pages:**
- `/requests/:id/matches` — ranked provider list with per-criterion score breakdown
- Visual weight slider (client-facing, picks from seeded configs)

---

## Phase 5 — Engagements & Ratings

**Goal:** Turn a recommendation into a contract and close the feedback loop.

**Backend:**
- `engagements` module — state machine `pending → accepted → in_progress → completed | cancelled`
- Lifecycle timestamps (`accepted_at`, `completed_at`, `cancelled_at`)
- `ratings` — bidirectional (client rates provider, provider rates client); only allowed on `status = completed` engagements
- Side-effect: update `provider_profiles.rating_average` / `rating_count` / `completed_engagements_count` in the same transaction

**Frontend pages:**
- `/engagements` — active work list for both roles
- `/engagements/:id` — status controls + rating submission after completion
- Provider dashboard widget: average rating + completed count

---

## Phase 6 — Admin + Effectiveness Review

**Goal:** Give admins operational control and satisfy the spec §4 evaluation requirement.

**Backend:**
- Admin user-management: paginated `findAll`, suspend/restore (`users.status`), soft-delete
- Algorithm comparison endpoint: given a `service_request`, return `match_results` grouped by `config_id` side-by-side
- Admin audit log table (actions: suspend, role-change, manual-match-trigger)

**Frontend pages:**
- `/admin/users` — paginated table with suspend/restore actions
- `/admin/requests` — all requests with status management
- `/admin/matching` — basic-v1 vs intelligent-v1 score comparison for a selected request
- `/admin/audit` — event log

---

## Priority Order Summary

| Phase | Unblocks |
|---|---|
| 2 — User infra + provider profiles | RBAC enforcement, 4 of 5 matching inputs |
| 3 — Service requests | Matching trigger |
| 4 — Matching engine | Core product value |
| 5 — Engagements + ratings | Rating criterion closes; feedback loop |
| 6 — Admin + evaluation | Spec §4 deliverable; operational safety |

Phase 2 is the clear next step — nothing in phases 3–6 can start without the profile data and enforced RBAC.
