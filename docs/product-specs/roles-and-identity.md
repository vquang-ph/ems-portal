# Roles and Identity

**Status:** Draft / design concept. Decisions marked explicitly.
**Scope:** Defines what a "user" is, what each role is, and what's deliberately out of scope.

This document predates the data-model and RBAC docs and should be read first — both of those depend on the framing established here.

---

## 1. Identity vs. Role

A **user** is _anyone with credentials in the system_. Authentication answers "are you who you say you are." A **role** answers "what are you allowed to do."

The current model glues them together: `users.role` is a single enum column. This is a deliberate v1 simplification, not a permanent truth. The data model should treat identity and role as separable so future evolution (multi-role users, organization membership) doesn't require schema upheaval.

This framing also exposes orthogonal user state that should **not** be modeled as roles:

- `status` — active, suspended, banned, pending_verification.
- `email_verified_at` — verification timestamp (almost certainly needed).
- `last_login_at` — security signal.

A Client can be suspended; a Provider can be unverified. These cut across roles and belong on `users`, not in the role enum.

---

## 2. Role Definitions

### 2.1 User (base concept)

- **Definition:** An authenticated identity. Has credentials, can log in, holds a session.
- **Owns:** email, name, password hash, refresh tokens, session/status state.
- **Does not own intrinsically:** profile data, marketplace behavior, business actions — those belong to roles.
- **Lifecycle:** `registered → active → (suspended | deleted | anonymized)`.

### 2.2 Client

- **Definition:** A user who _consumes_ engineering services through the platform.
- **Capabilities:**
  - Submit service requests (entry point of the matching pipeline).
  - View ranked provider matches for their requests.
  - Initiate engagement with a chosen provider.
  - Rate the provider after engagement completes.
  - Optionally: save favorite providers, manage payment methods (future).
- **Distinctive trait:** Client behavior is **per-request**, not persistent. They have no public profile; their data-of-record is the `service_requests` they own.

### 2.3 Service Provider

- **Definition:** A user who _offers_ engineering services through the platform.
- **Capabilities:**
  - Maintain a discoverable profile (bio, location, availability, rate, skills).
  - Appear in ranked match results for relevant requests.
  - Accept or decline engagements.
  - Deliver the service (off-platform; the platform does not model the work itself).
  - Receive ratings.
- **Distinctive trait:** They are the **searchable surface** of the marketplace. Their data is read constantly; the matching algorithm depends on them.
- **Explicit profile lifecycle:** `draft → active → suspended`. Registration eagerly creates a `provider_profiles` row in `draft` (see `data-model.md` §2.3); the provider must explicitly publish via `PATCH /provider-profiles/me/publish` after filling required fields and attaching at least one skill. Publishing flips `profile_status` to `active` — the moment the provider opts into being matched. Matchability further requires `is_available = true` and `users.status = 'active'`. The status enum is stored, not derived, so the matching engine has one indexable filter and publishing has one hook for validation, audit, and (future) notifications.

### 2.4 Admin

- **Definition:** A platform operator — internal staff, not a marketplace participant.
- **Capabilities:** Manage users (suspend, verify, delete), moderate content, view analytics, configure matching weights, resolve disputes.
- **Registration path:** Seed-only or admin-promoted. Never self-registered. (Already enforced via `PUBLIC_USER_ROLE_VALUES` in the auth schema.)
- **Known limitation:** "Admin" today is all-or-nothing. See §3.1.

---

## 3. Missing Roles — Honest Assessment

### 3.1 Moderator / Support — most important miss

The single `admin` role gives anyone handling a customer complaint the same powers as someone reconfiguring the matching algorithm. Real-world security risk and common audit finding.

In practice the split is:

- **Super Admin** — system config, manage other admins, modify matching weights. Tiny number of people.
- **Moderator / Support** — handle disputes, suspend marketplace users, view (not edit) sensitive data. Larger number of people.

**V1 recommendation:** Don't add a role yet, but **don't hardcode `role = 'admin'` checks for every admin action**. Use the permission layer (see `rbac-design.md`) so splitting later is a permission-map change, not a code rewrite.

### 3.2 Verifier / Trust authority — domain-specific

Engineering work has a credibility problem. Anyone can claim to be a "senior network engineer." Real marketplaces in regulated fields (legal, medical, engineering) have a verification workflow.

**V1 recommendation:** Not a role yet. Add `verified_at` timestamp + `verification_status` enum on `provider_profiles` so the gap is visible. A role can be introduced later if internal verification staff become a thing.

### 3.3 Organization / Multi-seat — not a role, structural gap

Engineering work is often B2B. A company hires through "Acme Corp," not "Jane the procurement officer's account." Currently no concept of organizations.

Affects:

- Ownership of service requests (Jane or Acme?).
- Payment (Jane's card or Acme's contract?).
- Acting on behalf of an org (Jane _and_ Bob from procurement).
- Provider-side firms vs. solo freelancers.

**V1 recommendation:** Individuals only. **Document explicitly** that multi-seat was deliberately out of scope, not forgotten. Retrofitting is painful — every "current user is X" query has to change.

### 3.4 System / Service accounts — low priority

Background jobs, the matching engine, scheduled tasks — they act on data. A single seed-only `system` user gives clean audit attribution. Trivially addable later.

### 3.5 Guest / Browse-only — product question, not a role

Should unauthenticated users browse provider profiles? SEO concern (Google can't index auth-walled pages). Not a DB role; a routing decision. Worth being explicit when committing.

---

## 4. V1 Scope Decisions

1. **Three roles only:** `client`, `service_provider`, `admin`. No additions.
2. **Add to `users`:** `status` (enum), `verification_status` (enum or nullable timestamp), `email_verified_at`.
3. **RBAC via permissions, not roles** (see `rbac-design.md`). Roles map to permissions; controllers check permissions. Future role splits become a map change.
4. **Documented deliberate limitations:**
   - One role per user (no multi-role).
   - No organization layer (individuals only).
   - No automated verification workflow.
   - No self-registration to `admin`.
5. **Reserve naming space:** if the table might split (e.g., `admins` → `super_admins` + `moderators`), pick a more generic name now or stick to user-level `role` enum + permission overlay.

The biggest unlock isn't adding roles — it's **decoupling roles from permissions** so role evolution doesn't require schema changes.
