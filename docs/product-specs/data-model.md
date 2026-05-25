# Data Model Design

**Status:** Recommended schema for v1.
**Scope:** Tables, relationships, and how each entity satisfies the product requirements in `spec.md`. Builds on `roles-and-identity.md` for identity decisions.

---

## 1. How the Model Maps to `spec.md`

| `spec.md` requirement | How the schema delivers |
|---|---|
| §3 RBAC for Client / Service Provider / Admin | `users.role` enum + `users.status` + role-conditional `provider_profiles` |
| §3 Provider profiles, skills, service request submissions | `provider_profiles`, `skill_categories`, `skills`, `provider_skills`, `service_requests` |
| §3 Five matching criteria (skill, availability, cost, location, rating) | Five explicit score columns on `match_results` |
| §3 Weighted scoring with adjustable weights | `matching_configs` holds named weight sets; every `match_results` row references the config used |
| §3 Database integrity, validation, transaction handling | DB-level CHECK constraints, unique constraints, FK enforcement, status enums driving state machines |
| §4 Effectiveness review: basic vs. intelligent matching | `matching_configs.algorithm_version` + audit-log semantics on `match_results` |
| §4 Scalability | `engagements` decouples recommendation volume from rating volume; denormalized aggregates on `provider_profiles`; monthly-partitioning plan for `match_results` |
| §4 Security & session management | `refresh_tokens` rotation chain; `email_verified_at`, `last_login_at`, soft-delete `deleted_at` on `users` |

Sections 2 and 3 expand on each entity and the cross-cutting decisions.

---

## 2. Entities

### 2.1 `users`

The single identity record for every actor on the platform, regardless of role.

- **Satisfies:** RBAC, authentication, admin user-management.
- **Role-conditional shape elsewhere:** `users.role` determines whether `provider_profiles` exists (provider) or whether the user is allowed to create `service_requests` (client). Enforced at the service layer — Postgres can't express "FK only when role = X" cleanly without triggers, and the trigger isn't worth its invisibility cost.
- **Notable fields:**
  - `role` — `client | service_provider | admin`.
  - `status` — `active | suspended | deleted`. Gives admins a lever to lock accounts without destroying history.
  - `email_verified_at`, `last_login_at` — security telemetry referenced in `roles-and-identity.md`.
  - `deleted_at` — soft delete. Preserves rating history on linked providers (see §3.1).
  - `password_hash` — bcrypt 10 rounds matches the existing implementation; argon2id is the modern recommendation if revisited.

### 2.2 `refresh_tokens`

Persistent half of the JWT auth flow. Access tokens are stateless and short-lived; refresh tokens are tracked here for rotation and revocation.

- **Satisfies:** spec §4 secure communication & session management.
- **Notable fields:**
  - `token_hash` — sha256, unique index. Raw tokens are never stored.
  - `family_id` — rotation chain identifier; if any token in a family is reused, the entire family is invalidated.
  - `replaced_by_token_id` — links a rotated token to its successor.

### 2.3 `provider_profiles`

Provider-specific data, 1:1 with `users` **only when `role = service_provider`**. Eagerly created at registration so the matching algorithm never sees a "provider with no profile" state.

- **Satisfies:** spec §3 provider profile management; supplies four of the five matching criteria (availability, cost, location, rating).
- **Notable fields:**
  - `latitude`, `longitude` (`numeric(9,6)`) — geographic proximity input. Numeric lat/lng over PostGIS — see §3.4.
  - `is_available` — availability criterion.
  - `hourly_rate_min`, `hourly_rate_max` — cost criterion.
  - `rating_average`, `rating_count`, `completed_engagements_count` — denormalized aggregates so matching reads hot fields without joins. Maintained in the same transaction as the source writes (consistent with the codebase's explicit-service-layer pattern). Periodic reconciliation job optional.
  - `verification_status`, `verified_at` — placeholder for the future verification workflow (`roles-and-identity.md` §3.2).
- **Not introduced:** `client_profiles`. Clients have no profile data in v1; add the table only when concrete needs emerge (billing addresses, preferences).

### 2.4 `skill_categories`

Catalog organization for the skills taxonomy.

- **Satisfies:** spec §3 skill management. Spec calls out "Network" / "Software" as initial categories.
- **Why a table, not an enum:** categories are expected to grow as the marketplace expands. Free-text was rejected — typo magnet.

### 2.5 `skills`

The platform's master skill list.

- **Satisfies:** spec §3 skill management; backs matching criterion #1 (skill compatibility).
- **Notable fields:**
  - `int id SERIAL` — fine for a catalog of <10k rows.
  - `category_id` FK → `skill_categories`.

### 2.6 `provider_skills`

Join table — which provider can do what, and at what level.

- **Satisfies:** matching criterion #1 (skill compatibility) — the input the scorer reads.
- **Notable fields:**
  - **Composite PK** `(profile_id, skill_id)` prevents duplicate rows for the same provider × skill pair.
  - `skill_id` indexed for the reverse lookup "find all providers with skill X" — a core matching query.
  - `level` (`junior | mid | senior | expert`) is the canonical proficiency signal; `years_of_experience` is kept alongside as a human-readable artifact, not as a duplicate source of truth.

### 2.7 `service_requests`

A client's posted job — the trigger for matching.

- **Satisfies:** spec §3 service request submissions; drives the matching engine.
- **Notable fields:**
  - `client_id` FK → `users.id`. Role enforcement (`users.role = 'client'`) is at the service layer plus integration test, not a DB trigger.
  - `budget_min`, `budget_max` `numeric(12,2)` — precision specified explicitly. No currency column in v1 — flagged as a known limitation (§4); adding currency post-data is a migration nightmare.
  - `target_latitude`, `target_longitude` — proximity input matching the provider columns.
  - `deadline` `timestamptz` — every timestamp column is `timestamptz` (see §3.2).
  - `status` enum — `open | matched | in_progress | completed | cancelled | expired`. The state machine drives business logic (e.g. only `open` requests get new matches).

### 2.8 `matching_configs`

Named weight sets for the scoring algorithm. The concrete answer to spec.md's "adjustable weighting mechanism."

- **Satisfies:** spec §3 weighted scoring + adjustable weights; spec §4 effectiveness review (basic vs. intelligent).
- **Notable fields:**
  - `algorithm_version` (`basic-v1`, `intelligent-v1`, etc.) — primary handle the effectiveness review uses to compare strategies.
  - `weight_skill | weight_availability | weight_cost | weight_location | weight_rating` — five `numeric(4,3)` columns, expected to sum to 1.0 (application-validated).
  - `is_active` — flags the live config for new matches; older rows remain for audit reproducibility.
- **Why a table, not hardcoded:** decouples algorithm tuning from deploys, and lets the effectiveness review run two configs in parallel against the same `service_request`.

### 2.9 `match_results`

The audit log of "we recommended provider X to request Y under algorithm Z."

- **Satisfies:** spec §3 intelligent matching output; spec §4 effectiveness review.
- **Retention model:** **audit-log semantics** — every (request, candidate, config) row persists. Spec §4 requires diffing basic vs. intelligent retrospectively, which forecloses cache-style invalidation. Plan monthly partitioning by `generated_at` from day one; at scale, `10k requests × 500 providers × 2 algorithms = 10M rows/cycle`.
- **Notable fields:**
  - Five explicit `numeric(5,4)` score columns — `skill_score`, `availability_score`, `cost_score`, `location_score`, `rating_score`. Direct mirror of $Score = \sum w_i c_i$. SQL-native analytics ("avg cost_score in March") work without JSONB gymnastics.
  - `total_score` — the weighted sum, materialized for ranking and indexed `DESC` per request.
  - `config_id` FK — the algorithm + weights that produced this row. Without it, the basic-vs-intelligent comparison is impossible to do retrospectively.
- **Constraints / indexes:**
  - Unique `(request_id, provider_id, config_id)` — same provider can appear once per algorithm per request.
  - Index `(request_id, total_score DESC)` — top-N queries.

### 2.10 `engagements`

The actual work record. Distinguishes "we recommended" from "they did the work."

- **Satisfies:** spec §3 data integrity; spec §4 scalability; enables a clean rating workflow.
- **Why it exists:** a match is a *recommendation*, not a contract. Ratings hanging off `match_results` would let users rate work that never happened. `engagements` bridges `service_requests` → provider → `ratings`.
- **State machine:** `pending → accepted → in_progress → completed | cancelled`. Ratings are only valid when `status = completed`.
- **Notable fields:**
  - `request_id`, `provider_id`, `client_id` — all three retained explicitly so "a provider's completed jobs" and "a client's history" don't require traversing requests.
  - `accepted_at`, `completed_at`, `cancelled_at` — lifecycle timestamps useful for SLA analytics.

### 2.11 `ratings`

Feedback. Closes the loop on matching criterion #5 (user rating).

- **Satisfies:** spec §3 rating system; feeds `provider_profiles.rating_average`.
- **Notable fields:**
  - `engagement_id` FK — ratings attach to engagements, never matches.
  - `rater_id`, `ratee_id` — explicit on the row. Enables bidirectional ratings (client rates provider *and* provider rates client) without future restructuring.
  - `score int CHECK (score BETWEEN 1 AND 5)` — DB-level integrity, not just Zod.
- **Integrity rule:** application enforces `engagement.status = 'completed'` before insert.

---

## 3. Cross-Cutting Decisions

### 3.1 Soft delete on `users`, no `ON DELETE CASCADE`

Cascade-deleting a `users` row would silently shrink the linked provider's `rating_count`, corrupting the matching signal. Instead:

- `users.deleted_at` for soft delete.
- A future anonymization workflow can replace PII while keeping the row (GDPR-compatible).
- Cascades **are** appropriate for the request-scoped chain: `service_requests → match_results` (recommendations for a withdrawn request are noise) and `engagements → ratings` (ratings without an engagement are meaningless).

### 3.2 Timestamp consistency

**Every timestamp column is `timestamptz`.** Mixing `timestamp` and `timestamptz` is a recurring bug source — application code reads them with different timezone semantics depending on driver config.

### 3.3 Required indexes

Beyond the unique constraints defined per-entity:

- `users(role)` partial index — provider filtering for matching.
- `provider_skills(skill_id)` — reverse lookup.
- `service_requests(status, created_at DESC)` — "list open requests."
- `service_requests(client_id, created_at DESC)` — "my requests" page.
- `match_results(request_id, total_score DESC)` — top-N candidates per request.
- `match_results(generated_at)` — partition pruning once monthly partitioning lands.

### 3.4 PostGIS — chose `numeric` lat/lng

`point` would imply PostGIS. Trade-off:

- For "providers within X km," `numeric(9,6)` lat/lng + bounding-box prefilter + haversine in SQL gets 80% of the way without an extension.
- PostGIS adds operational overhead (extension, image size, backups).

The schema commits to lat/lng. Re-introduce PostGIS only if matching grows real geospatial needs (polygons, routing, isolines); GIST indexes are reserved for that future case.

### 3.5 Audit-log retention for `match_results`

Spec §4 effectiveness review requires keeping both algorithms' outputs diffable months later. Operationally:

- Partition `match_results` by `generated_at` month from day one.
- Hot partitions stay in primary storage; old partitions either move to cold storage or get dropped per retention policy.
- Without partitioning, the table outgrows index efficiency within a single release cycle.

### 3.6 Schema coupling to `@ems-portal/types`

Per `CLAUDE.md`'s data-mapper convention, every entity `implements` the corresponding Zod type from the shared package. Adding a column to an entity without updating the shared schema is a compile error in the entity — the intended coupling, and the mechanism that keeps cross-boundary types honest.

---

## 4. Table Summary

| Table | Purpose |
|---|---|
| `users` | Identity, role, and status for every actor. |
| `refresh_tokens` | Rotation chain for JWT refresh flow. |
| `provider_profiles` | Provider-only profile; supplies 4 of 5 matching criteria. |
| `skill_categories` | Taxonomy parent for skills. |
| `skills` | Master skill catalog. |
| `provider_skills` | Provider × skill join (skill compatibility input). |
| `service_requests` | Client demand; triggers matching. |
| `matching_configs` | Named weight sets per algorithm version (basic / intelligent). |
| `match_results` | Audit log of recommendations with five score columns + total. |
| `engagements` | Actual work record — bridges matches to ratings. |
| `ratings` | Bidirectional feedback; feeds provider aggregates. |

---

## 5. Open Questions

1. **Weight ownership** — `matching_configs.is_active` implies a single live config per algorithm. If clients should tweak weights per request, either snapshot weights onto `service_requests` or expose a curated picklist of configs. Decide before generating the migration.
2. **Notifications** — matches / engagements / ratings imply notification triggers; defer the table until a notification surface lands.
3. **Admin audit log** — admin actions (suspending users, resolving disputes) need an audit trail. Flagged now, deferred.
4. **Currency** — single-currency v1. The column must land before real money data does.
5. **Multi-role / organizations** — explicitly out of scope for v1 (`roles-and-identity.md` §3.3). Retrofit cost is high.

---

## 6. ER Diagram

```
erDiagram
      USERS ||--o{ REFRESH_TOKENS : owns
      USERS ||--o| PROVIDER_PROFILES : "has (provider role only)"
      USERS ||--o{ SERVICE_REQUESTS : "creates (client role)"
      USERS ||--o{ ENGAGEMENTS : "client_in"
      USERS ||--o{ ENGAGEMENTS : "provider_in"
      USERS ||--o{ RATINGS : "rater / ratee"

      PROVIDER_PROFILES ||--o{ PROVIDER_SKILLS : possesses
      SKILLS ||--o{ PROVIDER_SKILLS : categorizes
      SKILL_CATEGORIES ||--o{ SKILLS : groups

      SERVICE_REQUESTS ||--o{ MATCH_RESULTS : generates
      USERS ||--o{ MATCH_RESULTS : "candidate (provider)"
      MATCHING_CONFIGS ||--o{ MATCH_RESULTS : "weighted_by"

      SERVICE_REQUESTS ||--o{ ENGAGEMENTS : results_in
      ENGAGEMENTS ||--o{ RATINGS : receives

      USERS {
          uuid id PK
          varchar_254 email "NOT NULL, UK, lowercased"
          varchar_120 name "NOT NULL"
          users_role_enum role "client|service_provider|admin"
          text password_hash "bcrypt/argon2id"
          user_status_enum status "active|suspended|deleted"
          timestamptz email_verified_at "NULL"
          timestamptz last_login_at "NULL"
          timestamptz deleted_at "soft delete; no CASCADE"
          timestamptz created_at
          timestamptz updated_at
      }

      REFRESH_TOKENS {
          uuid id PK
          uuid user_id FK
          uuid family_id "indexed (rotation chain)"
          text token_hash "UK, sha256 hex"
          timestamptz expires_at
          timestamptz revoked_at "NULL = active"
          uuid replaced_by_token_id "NULL until rotated"
          timestamptz created_at
          timestamptz updated_at
      }

      PROVIDER_PROFILES {
          uuid id PK
          uuid user_id FK "UK; only when role=service_provider"
          text bio "NULL"
          numeric_9_6 latitude "NULL"
          numeric_9_6 longitude "NULL"
          boolean is_available "DEFAULT true"
          numeric_12_2 hourly_rate_min "NULL"
          numeric_12_2 hourly_rate_max "NULL"
          numeric_3_2 rating_average "denormalized for matching"
          int rating_count "denormalized"
          int completed_engagements_count "denormalized"
          verification_status_enum verification_status "DEFAULT 'unverified'"
          timestamptz verified_at "NULL"
          timestamptz updated_at
      }

      SKILL_CATEGORIES {
          int id PK
          varchar_50 name "UK (e.g. Network, Software)"
      }

      SKILLS {
          int id PK
          varchar_100 name "UK"
          int category_id FK
      }

      PROVIDER_SKILLS {
          uuid profile_id FK "PK (composite)"
          int skill_id FK "PK (composite), indexed"
          proficiency_enum level "junior|mid|senior|expert"
          int years_of_experience "DEFAULT 0"
          timestamptz created_at
      }

      SERVICE_REQUESTS {
          uuid id PK
          uuid client_id FK
          varchar_200 title
          text description
          numeric_12_2 budget_min
          numeric_12_2 budget_max
          numeric_9_6 target_latitude "NULL"
          numeric_9_6 target_longitude "NULL"
          timestamptz deadline
          request_status_enum status "open|matched|in_progress|completed|cancelled|expired"
          timestamptz created_at
          timestamptz updated_at
      }

      MATCHING_CONFIGS {
          uuid id PK
          varchar_50 algorithm_version "UK, e.g. basic-v1, intelligent-v1"
          numeric_4_3 weight_skill "sum of weights = 1.0"
          numeric_4_3 weight_availability
          numeric_4_3 weight_cost
          numeric_4_3 weight_location
          numeric_4_3 weight_rating
          boolean is_active
          text notes "NULL"
          timestamptz created_at
      }

      MATCH_RESULTS {
          uuid id PK
          uuid request_id FK "UK with provider_id+config_id"
          uuid provider_id FK
          uuid config_id FK "which algo + weights produced this row"
          numeric_5_4 skill_score "0.0000 - 1.0000"
          numeric_5_4 availability_score
          numeric_5_4 cost_score
          numeric_5_4 location_score
          numeric_5_4 rating_score
          numeric_5_4 total_score "weighted sum; index DESC for top-N"
          timestamptz generated_at
      }

      ENGAGEMENTS {
          uuid id PK
          uuid request_id FK
          uuid provider_id FK
          uuid client_id FK
          engagement_status_enum status "pending|accepted|in_progress|completed|cancelled"
          timestamptz accepted_at "NULL"
          timestamptz completed_at "NULL"
          timestamptz cancelled_at "NULL"
          timestamptz created_at
          timestamptz updated_at
      }

      RATINGS {
          uuid id PK
          uuid engagement_id FK "CHECK engagement.status=completed"
          uuid rater_id FK
          uuid ratee_id FK
          int score "CHECK 1 <= score <= 5"
          text comment "NULL"
          timestamptz created_at
      }
```
