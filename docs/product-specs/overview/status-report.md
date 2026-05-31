# EMS Portal — Pre-Thesis Progress Report

_Last updated: 2026-05-27 · Working branch: `feat/service-provider`_

---

## 1. Project overview

The **Engineering Marketplace Service (EMS) Portal** is a web-based platform that connects clients who need engineering services with qualified engineering service providers. The system is designed around three groups of users:

- **Clients** — individuals or organisations posting requests for engineering work.
- **Service Providers** — engineers offering their skills and availability.
- **Administrators** — staff who oversee the catalogue of skills, moderate accounts, and review system performance.

The central research contribution of the project is an **intelligent multi-criteria matching mechanism** that ranks service providers against each client request using five weighted criteria: skill compatibility, availability, cost range, geographic proximity, and past user ratings. Formally, each provider receives a composite score

```
Score = (w₁ · c₁) + (w₂ · c₂) + … + (wₙ · cₙ)
```

where each `cᵢ` is the provider's score on criterion `i` (one of the five listed above) and each `wᵢ` is an adjustable weight that the administrator can tune to emphasise some criteria over others. A later evaluation phase will compare this intelligent, weighted approach against a simpler baseline (e.g. keyword-only matching) to measure the algorithm's effectiveness.

### Engineering focus

The project is evaluated from **two engineering angles**, and both are taken seriously throughout the work:

- **Software engineering** — clear requirement analysis, a modular three-layered design (Presentation / Business Logic / Data), and a disciplined testing strategy. The codebase is organised feature-by-feature, so each functional area can be built, tested, and reasoned about on its own.
- **Network engineering** — a secure client-server design with HTTPS communication, protection against common web vulnerabilities, careful session management, and explicit attention to **latency**, **response times**, and **behaviour under load**. These are not bonus concerns; they are core evaluation criteria of the thesis.

The system is built as a modern web application separated into three coordinated parts: a **server** (the back-end logic and database), a **client** (the user interface in the browser), and a **shared definitions layer** that guarantees both sides of the application agree on the structure of the data being exchanged.

---

## 2. Planned development phases and current status

The work is organised into six phases, intentionally sequenced so that each builds on the previous one. The table below summarises where the project stands at the time of writing.

| Phase       | Scope                                                                                                      | Status                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Phase 1** | User accounts and secure authentication (registration, login, session handling)                            | ✅ Completed                                          |
| **Phase 2** | Extended user profiles, dedicated service-provider profiles, and a managed catalogue of engineering skills | 🟡 In progress — final publication workflow under way |
| **Phase 3** | Service requests posted by clients                                                                         | ⬜ Not yet started                                    |
| **Phase 4** | The intelligent matching engine and the comparison configurations used for evaluation                      | ⬜ Not yet started                                    |
| **Phase 5** | Engagements (the agreed working relationship between a client and a provider) and the rating feedback loop | ⬜ Not yet started                                    |
| **Phase 6** | Administrator tooling and the final effectiveness review of the matching algorithm                         | ⬜ Not yet started                                    |

In short, the **foundations of the platform are complete**, the **profile layer is nearly complete**, and the remaining phases — which contain the research-relevant matching algorithm — are scheduled to follow.

---

## 3. What has been implemented so far

### 3.1 On the server side

The following functional areas are working end-to-end:

- **Authentication and account management** — users can register, log in, log out, refresh their session securely, and retrieve their own profile. The session-handling design follows current security best practice (signed access tokens with rotating refresh tokens).
- **User identity** — every account is stored with an email address (treated case-insensitively) and a securely hashed password. The user's identity is deliberately kept separate from their role, so the platform can later support users who hold more than one role without redesigning the database.
- **Service-provider profiles** — providers have a dedicated profile containing professional information (e.g. experience, hourly rate, location). The publication workflow that lets a provider move a profile from _draft_ to _active_ (visible to clients) and later to _suspended_ is the work currently being finalised on the active branch.
- **Skill catalogue** — administrators can manage a structured catalogue of engineering skills, grouped into categories. Providers will be able to attach skills from this catalogue to their profile.
- **System health and monitoring endpoints** — small but important utilities that allow operations staff (and the automated test pipeline) to confirm the service is alive and responding.

### 3.2 On the client side (browser interface)

- **Authentication screens** — login and registration pages, with the automatic session-refresh mechanism that was added on the current branch.
- **Service-provider profile screens** — pages for viewing a profile and for the guided initial setup. These read and write data through the back-end services described above.

### 3.3 Database

The data structures backing the platform are defined and version-controlled as _migrations_ — small, ordered scripts that bring the database from one well-known state to the next. Three migrations exist:

1. The initial schema covering users and authentication (Phase 1).
2. The extension introducing provider profiles and the skill catalogue (Phase 2).
3. A pending migration, accompanying the current branch, that introduces the publication-status column for provider profiles.

Initial test data ("seed data") is provided for users, skills, and provider profiles so that the platform is usable immediately after installation.

### 3.4 Quality assurance: the automated pipeline

Beyond the application features themselves, a complete **automated review pipeline** is already in place. Every proposed change to the codebase passes through it before it can be merged. Conceptually, the pipeline performs the role of a tireless reviewer who runs the same set of checks on every contribution.

The pipeline is made up of six coordinated workflows:

| Workflow                 | What it checks                                                                                                                                                 | When it runs                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Orchestrator**         | Acts as the entry point; decides which of the workflows below need to run, based on which part of the project changed.                                         | On every proposed change                        |
| **Style check**          | Three parallel checks: commit-message format (consistency of project history), code formatting, and code-quality rules.                                        | Always                                          |
| **Build and unit tests** | Confirms the code still compiles and passes its catalogue of fast, isolated tests. Publishes a coverage summary as a comment on the proposed change.           | Only when the relevant part of the code changes |
| **Security audit**       | Scans third-party dependencies for known vulnerabilities. Fails the review if any _high_ or _critical_ issue is detected.                                      | Always                                          |
| **Integration tests**    | Starts a real database, applies all migrations and seed data, and then runs the slower tests that exercise the full server stack.                              | Only when server code changes                   |
| **Deployment readiness** | Assembles the full application using container images, starts it, and verifies that both the server and the user interface respond correctly to live requests. | Always                                          |

The pipeline runs on a fixed software environment (Node.js version 22.12.0) and uses temporary, throwaway credentials for testing — no production secrets are involved.

The key benefit is that **no change reaches the main branch without first being built, formatted, linted, security-scanned, unit-tested, integration-tested, and proven to start up as a complete system.**

---

## 4. Work currently in progress (branch `feat/service-provider`)

The active branch closes the last gap in Phase 2: the **profile publication lifecycle**. Concretely, the changes do the following:

- Add a new field to the provider profile indicating whether the profile is a _draft_, _active_, or _suspended_.
- Introduce a dedicated server action — `Publish my profile` — that performs the validation and transitions the profile to _active_.
- Update the user interface so providers can see their current publication state and trigger publication.
- Refresh the user's session after publication so that their newly granted permissions take effect immediately, without requiring a manual log-out.
- Update the shared data definitions and the relevant documentation pages so that both halves of the application stay consistent.

Once this branch is merged, Phase 2 is complete and development can move on to Phase 3 (service requests).

---

## 5. Known gaps and risks

- **The core research feature has not yet been implemented.** The intelligent matching engine (Phase 4) is the centrepiece of the thesis. Until Phases 3–5 are built, the end-to-end value proposition (request → match → engagement → rating) cannot yet be demonstrated.
- **No administrator interface yet.** The permission system already recognises administrators, but no dedicated administrator screens exist. This is planned for Phase 6.
- **Geographic proximity is approximated.** Locations are currently stored as plain latitude/longitude numbers. Phase 4 will need to decide between a mathematical approximation (the Haversine formula) and adopting a specialised geographic database extension. The decision has been deliberately deferred to keep early phases simple.

---

## 6. Testing strategy

Software testing on this project is organised around a deliberate principle, often illustrated as a _testing pyramid_: **a broad base of fast, isolated tests, supported by a smaller layer of realistic end-to-end checks for the most critical paths, and topped by a focused set of security and performance assessments.** This combination is widely accepted in modern software engineering as the best balance between speed of feedback (so that mistakes are caught within minutes of being made) and confidence in correctness (so that what passes the tests can be trusted in production). The pyramid shape is intentional: cheap, narrow tests outnumber expensive, broad ones, because broad tests are slower, more brittle, and more difficult to diagnose when they fail.

### 6.1 Two categories of automated tests

- **Unit tests.** Each small component (a single class or a single function) is tested in isolation, with its surroundings replaced by simplified "stand-ins" (known in the literature as _test doubles_, _mocks_, or _stubs_). These tests run in seconds, make it easy to localise the cause of a failure, and protect against accidental regressions whenever the code is refactored. Because they touch no database and no network, they can be executed thousands of times per day without overhead.
- **Integration tests.** A smaller number of tests exercise several real components together — most importantly, the server in combination with a real database. These tests verify that the pieces interact correctly, that database queries return the expected rows, that the schema produced by the migrations is consistent with the application's assumptions, and that error paths (e.g. unique-constraint violations, missing records, transaction rollbacks) behave as designed. They are slower than unit tests, but they catch entire classes of bugs that no amount of mocking can reveal.

### 6.2 Server-side testing

- The server is currently covered by unit tests across all completed modules: authentication, user identity, service-provider profiles, and the skill catalogue. Tests are co-located with the code they exercise, so a developer working on a module sees its tests immediately and is encouraged to keep them current.
- Integration tests exist for the authentication flows (registration, login, refresh, logout, retrieving the current user). A previously written integration test for the provider-profile module is **temporarily disabled** and will be re-enabled, with new assertions for the publication lifecycle, alongside the current branch.
- A minimum **coverage threshold of approximately 80%** (lines, functions, statements) and **70%** (branches) is enforced automatically. Coverage measures the percentage of code that is actually executed by the test suite, so a falling number is an early signal that new code was added without corresponding tests. If a proposed change reduces coverage below the threshold, the automated pipeline rejects the change.

### 6.3 Client-side testing

- The user interface is tested using a framework that simulates a real browser environment and interacts with components the way a user would (clicking, typing, reading visible text), rather than inspecting internal implementation details. This is sometimes called _behaviour-driven_ testing: it asks "does the component do what the user expects?" rather than "is this internal variable set correctly?" — which produces tests that survive future refactoring and closely mirror real user experience.
- Each feature area in the user interface owns its own collection of test data ("fixtures") and shared identifiers, so tests remain readable and maintainable as the interface evolves.
- The same 80% minimum coverage threshold applies, enforced per file.

### 6.4 Continuous verification

Both kinds of tests are executed automatically by the pipeline described in §3.4 on every proposed change. The integration tests in particular act as the early-warning system that catches mismatches between the code and the database schema before they reach the main branch. Because the pipeline runs unattended, the cost of running the full suite is essentially free: developers receive feedback within minutes, and no change can be merged without the verdict.

### 6.5 Security testing and penetration testing

Because the platform handles personal data, professional credentials, and (in later phases) commercial engagements, security is treated as a first-class concern rather than an afterthought. The plan is layered:

- **Automated dependency auditing** _(already in place)._ Every proposed change is scanned for third-party libraries with known vulnerabilities. The pipeline fails on any _high_ or _critical_ finding, ensuring that the project never knowingly ships with a publicly disclosed weakness in its supply chain.
- **Built-in defensive measures** _(in place across the existing modules)._ The application already enforces password hashing with `bcrypt`, signed JSON Web Tokens with rotating refresh tokens, server-side input validation on every request, role-based access control, and HTTPS-only communication. These are the foundations that any subsequent penetration test will probe.
- **Penetration testing (planned).** Before the final thesis evaluation, the platform will undergo a **structured penetration test** to verify that the implemented defences hold up against adversarial behaviour. The plan is to follow a well-established methodology — most likely the **OWASP Testing Guide** in combination with the **OWASP Top 10** as a reference list of common attack categories — and to combine automated scanning with manual exploration. Concretely, the penetration test will exercise at least the following categories:
  1. **Authentication and session management** — credential-stuffing resistance, password-policy enforcement, brute-force protection, refresh-token replay/reuse, session fixation, and correct invalidation on logout.
  2. **Authorisation / access control** — vertical privilege escalation (a regular user attempting administrator actions) and horizontal privilege escalation (one user attempting to access or modify another user's records, sometimes called _IDOR_ — Insecure Direct Object Reference). The role-based access control mechanism will be probed against every endpoint.
  3. **Input handling** — injection attacks (SQL injection, command injection), cross-site scripting (XSS) in both stored and reflected variants, and mass-assignment attempts that try to overwrite protected fields.
  4. **Cross-site request forgery (CSRF)** — verifying that state-changing requests cannot be triggered from a malicious origin without the user's consent.
  5. **Transport security** — confirming HTTPS-only behaviour, secure cookie flags, and the absence of sensitive data in URL parameters or logs.
  6. **Information disclosure** — checking that error messages, stack traces, and HTTP headers do not leak internal implementation details to unauthenticated clients.
  7. **Rate limiting and denial-of-service resilience** — measuring the system's behaviour under a sudden burst of requests to identify endpoints that need throttling.

  The penetration test will be conducted in a **controlled staging environment** that mirrors production, using a combination of automated tools (e.g. **OWASP ZAP**, **Nikto**, **sqlmap**) and manual exploratory testing. Each finding will be logged with a severity rating, a reproduction path, and a remediation. The remediations will then be implemented and re-tested, and the final outcome — vulnerabilities found, fixed, and any residual risk — will be documented as part of the thesis's network-engineering evaluation. This dual-perspective treatment (build a secure system _and_ prove it is secure under attack) is what distinguishes a network-engineering thesis from a purely functional software project.

### 6.6 Performance and load testing

Latency and behaviour under load are explicit evaluation criteria of the thesis. A **k6-based load-testing harness** already exists and is run manually during development. The plan is to:

- Wire the load-testing harness into the automated pipeline so that performance regressions are caught the same way functional regressions are.
- Establish baseline measurements for key user flows (login, profile retrieval, and — once Phase 4 is in place — request-to-match) under realistic concurrency levels.
- Use these measurements to validate the system against the response-time and throughput targets defined in the product specification, and to compare the two matching configurations (intelligent vs. baseline) on equal footing.

### 6.7 Gaps to address in later phases

- Introduce a small set of **end-to-end tests** that drive the entire system through a real browser. These will be especially valuable once the matching workflow (Phases 3–5) is in place, because that workflow crosses every layer of the application — from the user interface, through authentication, into the matching engine, and back out as a ranked list of recommended providers.
- Re-enable the temporarily disabled provider-profile integration test, expanded to cover the new publication transitions.
- Conduct the first full penetration-test pass as soon as Phase 5 (engagements + ratings) is implemented, since that is the point at which the most sensitive interactions (financial-shaped data, personal feedback) enter the system.

---

## 7. Supporting documentation and design references

The following internal documents describe the design decisions referenced in this report and can be consulted for additional detail:

- **Product specification** — the founding document, describing the dual software/network engineering focus, the layered architecture, the five matching criteria, and the weighted scoring formula that drives the evaluation phase.
- **Data model specification** — describes every table in the database, the relationships between them, and the rationale behind key design choices.
- **Roles and identity specification** — explains the separation between a user's identity and the roles they hold, and lists the permissions associated with each role.
- **Role-based access control design** — describes the three-layer authorisation mechanism (global enforcement, fine-grained permissions, and ownership checks on individual records).
- **Back-end and front-end architectural guides** — describe the conventions and structure that every feature module follows, ensuring the codebase remains uniform as it grows.
- **Testing foundations** — the canonical reference for the testing philosophy summarised in §6.

---

## 8. Summary

At the time of writing, the project has delivered a **secure authentication system**, **user and service-provider profile management**, and a **managed skill catalogue**, all backed by a rigorous automated quality pipeline and a layered testing strategy. The publication workflow that completes Phase 2 is in active development and will be merged shortly. The subsequent phases — service requests, the intelligent matching engine, the engagement and rating loop, and the administrator surface — remain to be built and represent the principal remaining work of the thesis.
