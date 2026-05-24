# Data Model Design

**Status:** Draft / design concept. Critical review of the proposed schema with revised recommendations.
**Scope:** Tables, relationships, scalability concerns. Builds on `roles-and-identity.md`.

---

## 1. Three Structural Issues to Resolve First

### 1.1 `profiles` 1:1 with every user is wrong

A Client doesn't have a `bio`, `location`, or `is_available`. Admins have none of those. Forcing a profile row on every user creates mostly-empty records and obscures intent.

**Decision:** Only Service Providers have profiles. Table is `provider_profiles`, 1:1 with `users` *only when `role = service_provider`*. Eagerly created at registration so the matching algorithm doesn't need to handle "provider with no profile" states.

Enforce the role-conditional FK at the service layer (consistent with the rest of the codebase). Postgres can't directly express "FK only when role = X" without triggers, and the trigger isn't worth its invisibility cost.

If Client profile data ever emerges (preferences, billing addresses), introduce `client_profiles` then — not preemptively.

### 1.2 `match_results` is the scalability landmine

If matches are persisted for every request × every candidate provider, growth is quadratic. 10k requests × 500 providers = 5M rows; at scale, tens of millions of stale recommendations.

**Decide upfront:** cache, audit log, or working set?

- **Cache** — store top-N (e.g., 20) per request, invalidate when providers change. Needs invalidation logic.
- **Audit log** — store everything for analytics. Massive growth; partition by month or move to cold storage.
- **Working set** — store only matches the client interacted with.

**Recommendation for the spec:** Section 4 of `spec.md` calls for an "Effectiveness Review: comparison between basic and intelligent matching" — that argues for **audit-log semantics**. Plan for partitioning by month from day one, or define an explicit retention policy.

**Also:** `criteria_breakdown jsonb` is convenient but hostile to analytics. "Average cost-score across all matches in March" is painful over JSONB. Better:

- 5 explicit columns: `skill_score`, `availability_score`, `cost_score`, `location_score`, `rating_score`.
- Separate `weights_used jsonb` (weights are configurable per request/algorithm version; scores are stable shape).

### 1.3 Ratings should not hang off `match_results`

A match is a *recommendation*, not a contract. You can't rate something that didn't happen.

**Introduce an `engagements` (or `bookings`, `jobs`) table:**

```
engagements: id, request_id, provider_id, client_id,
             status (pending | accepted | in_progress | completed | cancelled),
             accepted_at, completed_at, cancelled_at
```

Then `ratings.engagement_id → engagements.id`. This unlocks:

- "Show me a provider's completed jobs" (distinct from matches they appeared in).
- Bidirectional ratings (client rates provider, provider rates client — common marketplace pattern).
- Natural integrity rule: can't rate until `engagement.status = completed`.

Without this table, the model can't distinguish "we recommended" from "they actually did the work."

---

## 2. Per-Table Notes

### 2.1 `users`

- Solid. Aligns with existing `UserEntity` and `AuthSchema`.
- `password_hash text` — fine; bcrypt output is 60 chars so `varchar(72)` is conventional but cosmetic.
- bcrypt 10 rounds is acceptable. argon2id is the modern recommendation if making the call now.
- **Add (per `roles-and-identity.md`):** `status`, `email_verified_at`, `last_login_at`.

### 2.2 `refresh_tokens`

- Matches existing implementation. Ensure `token_hash` has a unique index.

### 2.3 `provider_profiles` (renamed from `profiles`)

Eagerly created when a user registers with `role = service_provider`. 1:1 with `users`. Includes:

- `bio`, `location`, `is_available`, `hourly_rate_min`, `hourly_rate_max`.
- **Denormalized aggregates** for matching performance: `rating_average`, `rating_count`, `completed_engagements_count`. Maintained app-side in the same transaction as the source writes (consistent with the codebase's explicit-service-layer pattern). Periodic reconciliation job optional.
- `verified_at` + `verification_status` enum (placeholder for future verification workflow — see `roles-and-identity.md` §3.2).

### 2.4 `skills`

- `int id SERIAL` is fine for a catalog.
- `category varchar_50` is a typo magnet. Either a Postgres enum (if fixed: `'network' | 'software'`) or a `skill_categories` table (if growth expected). Free-text is the worst of both worlds.

### 2.5 `provider_skills`

- **Add composite PK** `(profile_id, skill_id)` to prevent duplicates.
- `years_of_experience` + `level` is redundant. Pick one or define why both exist.
- Index on `skill_id` for "find all providers with skill X" — a core matching query.

### 2.6 `service_requests`

- `client_id FK → users.id` doesn't enforce `users.role = 'client'`. Trust the app layer + integration test. Triggers not worth the complexity.
- `budget_min/max decimal` — specify precision: `numeric(12, 2)`.
- **No currency column.** Acceptable for v1; flag explicitly as a known limitation. Adding currency post-data is a migration nightmare.
- `deadline timestamp` should be `timestamptz`. **Be consistent — every timestamp column should be `timestamptz`.**
- Define `status` enum values now: `'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled' | 'expired'`. State machine drives business logic.

### 2.7 `match_results`

- See §1.2 above for the scalability and JSONB decisions.
- Unique index on `(request_id, provider_id)` — provider shouldn't appear twice per request.
- Index on `(request_id, intelligence_score DESC)` for top-N queries.

### 2.8 `engagements` (new)

- Bridges `service_requests` → `provider` → `ratings`.
- State machine: `pending → accepted → in_progress → completed | cancelled`.
- Ratings can only be created when `status = completed`.

### 2.9 `ratings`

- Point at `engagement_id`, not `match_id`.
- Add explicit `rater_id` — derivable through joins, but explicit enables bidirectional ratings without restructuring.
- `score int CHECK (score BETWEEN 1 AND 5)` — DB-level integrity, not just Zod.

---

## 3. Cross-Cutting Concerns

### 3.1 `ON DELETE CASCADE` is too aggressive

If a Client deletes their account:
- `service_requests` cascade — fine.
- `match_results` cascade through requests — fine, but provider history shrinks silently.
- `ratings` cascade — **provider's rating count drops retroactively**. Bad.

**Recommendation for users:** soft delete (`deleted_at`) or anonymization (replace PII, keep the row). GDPR-compliant deletion is a deliberate workflow, not a `CASCADE`.

For `service_requests → match_results → ratings`: cascade is fine.

### 3.2 Timestamp consistency

**Every timestamp column must be `timestamptz`.** Mixing `timestamp` and `timestamptz` is a recurring bug source.

### 3.3 Required indexes (beyond unique constraints)

- `users(role)` — partial index for provider filtering.
- `provider_skills(skill_id)` — reverse lookup.
- `service_requests(status, created_at DESC)` — list open requests.
- `service_requests(client_id, created_at DESC)` — "my requests" page.
- GIST index on `provider_profiles.location` and `service_requests.target_location` if PostGIS is used.

### 3.4 PostGIS — decide deliberately

`point` for location implies PostGIS. Trade-off:

- PostGIS adds operational overhead (extension, image size, backups).
- For simple "providers within X km," lat/lng numeric columns + bounding-box prefilter + haversine in SQL gets 80% of the way without PostGIS.
- If matching needs real geospatial features (polygons, routing, isoline distances), commit to PostGIS.

Don't drift into PostGIS by accident. Pick the simpler path unless requirements clearly need the heavier tool.

---

## 4. Revised Table Count

Originally proposed: **8 tables**. Recommended: **9–10 tables**.

| Table | Status |
|---|---|
| `users` | Keep. Add `status`, `email_verified_at`, `last_login_at`. |
| `refresh_tokens` | Keep as-is. |
| `provider_profiles` | Renamed + scoped to providers only. Add denormalized aggregates. |
| `skills` | Keep. Decide enum vs. table for category. |
| `provider_skills` | Add composite PK. Add `skill_id` index. |
| `service_requests` | Tighten types (`timestamptz`, `numeric(12,2)`, status enum). |
| `match_results` | Decide retention strategy. Explode JSONB into score columns. |
| **`engagements`** | **New.** Bridges matches → ratings. |
| `ratings` | Point at `engagement_id`. Add `rater_id`. CHECK constraint on score. |
| `skill_categories` (optional) | Only if categories will grow beyond a fixed enum. |

---

## 5. Open Questions

1. **Weights configurability** — `spec.md` calls for "adjustable weighting mechanism." Where do weights live? Per-system? Per-client? Per-algorithm-version? A `matching_configs` table? Hardcoded with admin override? Design call, not just schema.
2. **Notifications** — if matches/engagements/ratings drive notifications, that's another table. Deferrable.
3. **Audit log** — admin actions on users/disputes need an audit trail. Deferrable but flag now.
4. **Currency** — single-currency v1, but the column has to land before real data does. Flag explicitly.
5. **Multi-role / organizations** — see `roles-and-identity.md` §3.3. V1 deliberately excludes; retrofit cost is high.
