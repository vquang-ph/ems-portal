# Market Research

## Pre-Thesis Conception and Architectural Objectives

In partial fulfillment of the academic requirements at Vietnam National University, Ho Chi Minh City – International University, a comprehensive pre-thesis project has been registered under the supervision of Đinh Đức Anh Vũ and Võ Minh Thạnh. The project, proposed by Phạm Vũ Quang, a Network Engineering major, is titled **Design and Implementation of a Digital Marketplace Platform for Engineering Services with Intelligent Multi-Criteria Service Matching**.

This project addresses a dual-domain engineering challenge. From a software engineering perspective, it focuses on constructing a highly modular, scalable, web-based client-server platform using relational transaction models, systematic unified modeling language (UML) designs, and layered business-logic abstractions. From a network engineering perspective, the system is designed to optimize client-server communication paths, enforce secure HTTPS protocols, minimize request latency, and validate overall system performance under heavy, simulated user loads.

The core functional goal of this platform is to replace the inefficient, manual matching processes typical of standard freelance platforms with an automated, intelligent multi-criteria matching engine. To establish the commercial and technical necessity of this platform, this report presents an exhaustive market analysis. It reconciles global outsourcing trends, evaluates the structural failures of legacy platforms, and details the mathematical, database, and security architectures required to implement this platform.

## Global Market Dynamics and the Demand for On-Demand Engineering

The global landscape for engineering and research and development (R&D) outsourcing is undergoing a major structural expansion. Driven by rising global R&D spending, which is projected to reach €2.719 billion in 2026—a 56% increase—enterprises are facing severe pressure to shorten product lifecycles and integrate advanced digital technologies. This has forced a strategic shift from transactional outsourcing toward collaborative engineering service models.

A detailed reconciliation of global market data reveals massive capital flows into the Engineering Services Outsourcing (ESO) sector. While different market research firms show variations in market size due to their analytical scopes, the upward trajectory and compound growth rates remain highly consistent across the industry.

| Market Research Analyst Report | Scope of Evaluation                                                                | Base Year Valuation      | Mid-Term Projection                                   | CAGR              | Key Structural Driver                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| **SkyQuest Insights**          | Total Global ESO Market (including automotive, aerospace, R&D, and IT integration) | USD 2.04 Trillion (2024) | USD 14.77 Trillion (2033)                             | 24.6% (2026–2033) | Rapid integration of next-gen digital tools and high cost-cutting pressures.                            |
| **Market.us Statistics**       | Comprehensive Global Engineering & Technical R&D Outsourcing                       | USD 828.8 Billion (2024) | USD 1,276.5 Billion (2026) / USD 5.79 Trillion (2033) | 24.1% (2024–2033) | Scarcity of local specialized engineering talent and high GDP risks of engineering vacancies.           |
| **Technavio Research**         | Core Product Design, Simulation, and Advanced Technical Analytics                  | Base Year (2025)         | USD 532.17 Billion Increase (2026–2030)               | 25.7% (2026–2030) | Labor wage arbitrage and the adoption of digital twins, mechatronics, and hardware-in-the-loop testing. |
| **Grand View Research**        | Advanced Prototyping, Designing, and System Validation Services                    | USD 2.57 Billion (2024)  | USD 9.41 Billion (2030)                               | 23.4% (2025–2030) | Rising demand for specialized medical devices, IoT, robotics, and energy optimization.                  |
| **Reanin Market Analysis**     | High-End Digital Technology Integration Contracts                                  | Base Year (2025)         | USD 7,001.16 Million (2032)                           | 18.6% (2026–2032) | Shift toward long-term, multi-year co-innovation partnerships and shared IP development.                |

These statistics reveal a clear division in how the market is analyzed. Broad macroeconomic reports, such as those from SkyQuest and Market.us, capture the entire technical ecosystem, including large enterprise software delivery and outsourced aerospace and automotive R&D. On the other hand, reports from Grand View Research and Reanin isolate specific technical services, such as physical hardware testing, embedded system validation, and advanced mechatronic prototyping.

Regardless of the scope, this data highlights a fundamental challenge: a severe, structural shortage of engineering talent across the globe. For example, the United States is projected to face a shortage of over 186,000 highly skilled engineers by 2031, particularly in software, industrial, civil, and electrical engineering. Because 92% of global enterprise leaders identify attracting and retaining engineering talent as their highest organizational risk, on-demand marketplaces are becoming essential to maintain engineering capability and prevent major project delays.

## Structural Deficiencies of Horizontal Gig Marketplaces

Despite the massive demand for engineering services, contemporary freelance platforms are poorly equipped to support high-stakes, specialized engineering projects. Traditional horizontal platforms are designed for high-volume, generic, and transactional tasks, which introduces significant quality, security, and operational risks for complex engineering.

### Reliability, Operational Continuity, and Control Risks

Engineering and product development projects involve complex, multi-phase lifecycles. A survey of enterprise leaders indicates that 54% cite the fear of losing control over product development as the primary barrier to outsourcing R&D and product engineering.

This fear is directly validated by the behavior of freelancers on generic platforms, where there is a notable lack of operational continuity. High-volume freelance platforms are built for short-term, transactional tasks; consequently, freelancers can suddenly disappear mid-project, leaving clients with half-finished code or incomplete hardware designs.

Furthermore, generic platforms fail to offer proper workflow integration. Freelancers operate as isolated individuals rather than as embedded resources, creating significant friction in communication, time-zone coordination, and tool alignment.

### Deficiencies in Quality Control and Skill Verification

Specialized engineering requires highly accurate execution. However, generic platforms lack deep, technical vetting processes, allowing freelancers to pad their profiles and accept complex projects that exceed their true technical capabilities.

Because legacy marketplaces use simple star-rating systems to determine search visibility, freelancers often generate fake reviews and manipulate their ratings to appear more competitive. This review inflation makes it incredibly difficult for businesses to verify actual skills, resulting in costly, repetitive trial-and-error cycles.

### High Friction and Screening Inefficiencies

To address these quality issues, some premium platforms have implemented highly rigid, multi-phase screening processes, including algorithmic tests and unpaid test projects. However, these methods introduce new problems:

| Screening Phase Metric         | Traditional High-Barrier Platforms                                     | Expected Value Impact for Top Talent                        |
| ------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Time Investment**            | 60 to 100+ hours of unpaid, rigorous testing.                          | High opportunity cost with zero guaranteed income.          |
| **Platform Rejection Rate**    | Often exceeds 97% of all applicants.                                   | Excludes highly qualified, working professionals.           |
| **Bidding and Proposal Costs** | Pay-per-proposal fee structures costing USD 312 to USD 1,248 annually. | Highly discouraging for experienced, established engineers. |
| **Skill Validation Accuracy**  | Outdated, multiple-choice testing easily cheated via forums.           | Fails to predict real-world engineering problem-solving.    |

This high-friction screening environment drives away top-tier, active engineering talent, who refuse to waste uncompensated hours on rigid screening processes. This leaves platforms flooded with candidates who specialize in passing tests rather than delivering actual, high-quality engineering work.

### High Transaction Commissions and Financial Friction

Generic marketplaces charge steep transaction commissions to both buyers and sellers. These fees eat directly into the cost savings that enterprises seek to achieve through outsourcing. For high-budget engineering projects, these transaction commissions can offset the savings entirely, making it more practical for businesses to hire full-time employees rather than using a platform.

### Security, Intellectual Property, and Compliance Exposure

Engineering work involves proprietary designs, trade secrets, and strict compliance standards. Traditional freelance platforms offer minimal legal protection, data security, or intellectual property (IP) safeguards.

Enterprises outsourcing engineering tasks face significant exposure to IP theft, data breaches, and regulatory compliance violations. Without standard security audits (such as ISO 27001), localized legal contracts, and strict data protection frameworks, enterprises cannot safely share their proprietary source code, electrical schematics, or CAD designs on generic platforms.

## Competitive Landscape Analysis: Niche vs. Horizontal Platforms

To position this pre-thesis platform effectively, it is critical to deconstruct the active competitive landscape. Sourcing and matching platforms for technical services generally split into three distinct categories: specialized B2B engineering platforms, premium tech recruitment networks, and regional generalist marketplaces.

| Platform                        | Primary Target Audience                           | Vetting and Verification Model                  | Matchmaking Philosophy                                   | Key Architectural or Legal Limitation                                          |
| ------------------------------- | ------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Proposed Platform**           | Solo clients and individual service providers     | V1 database verification with active lifecycles | Automated dynamic multi-criteria scoring vector          | Restricted to individual accounts in early iterations (no multi-seat agencies) |
| **Engre (Engre.co)**            | Globally registered B2B engineering companies     | Manual validation of corporate credentials      | Static catalog search and smart manual filtering         | Strict B2B corporate focus; completely excludes individual freelancers         |
| **Tasker (Taskerplatform.com)** | Hardware, electronics, and mechanical specialists | Individual "Skills Passport" system             | Instant, zero-negotiation matchmaking without job boards | Black-box matching algorithm with no client-adjustable weights                 |
| **vLance.vn**                   | Generic freelancers in Vietnam                    | Unvetted, public user-created profiles          | Traditional manual job posting and bidding wars          | Unmanaged quality controls with widespread rating inflation                    |

### Specialized B2B and Hardware Engineering Competitors

- **Engre (Engre.co):** Operating as a global B2B digital engineering services platform, Engre unites companies across 24 specific industries including aerospace, civil engineering, robotics, and mechatronics. It addresses the security pain points of legacy gig marketplaces by coordinating electronic signatures, project tracking dashboards, and legal enforcement bound strictly to US jurisdiction. However, Engre is structured as a directory of _companies_ rather than individuals, leaving small startups and individual engineers excluded from its ecosystem. Furthermore, it relies on static directory filtering and manual negotiation rather than a dynamic, automated multi-criteria matching engine.
- **Tasker (Taskerplatform.com):** Specifically designed to match tasks in the hardware, electrical, and mechatronics sectors, Tasker matches engineering experts with short-term projects. It replaces the classic CV with a "Skills Passport" and bypasses public job boards entirely. Instead, Tasker's platform performs automated shortlisting and contacts matching engineers directly. While highly innovative, Tasker's matching algorithm operates as a black-box system, and the platform does not allow clients to dynamically adjust matching parameters or compare alternative scoring weights.
- **Cad Crowd:** Unlike generic sites, Cad Crowd concentrates on CAD drafting, MEP (mechanical, electrical, plumbing), and architectural design challenges. It relies heavily on "Design Contests" where clients post a cash prize and receive competing design submissions. While effective for aesthetic modeling and simple prototyping, this competition-based approach is poorly suited for the continuous, collaborative network protocols and deep client-server integrations addressed in this pre-thesis.

### Premium Tech Recruitment and Sourcing Platforms

- **Toptal:** Toptal markets itself as a network representing the "top 3%" of freelance software developers, designers, and finance experts. To maintain this tier, it enforces a rigorous, multi-week screening process including live coding and practical tests. However, Toptal handles matchmaking entirely behind the scenes and embeds steep, opaque markups (frequently exceeding 50% to 100% of the engineer's take-home rate) onto the client's invoice. This pricing model is prohibitively expensive for early-stage startups and small businesses.
- **Arc.dev:** Originally founded as a mentoring platform (Codementor), Arc.dev focuses on remote senior tech talent using AI-assisted matching pipelines to reduce manual screening. While Arc.dev is highly effective for standard software development roles, it lacks domain-specific schemas or calculations for physical spatial coordinates, geographic bounding-box prefiltering, or hardware-specific mechatronic taxonomies.

### Local Vietnamese Competitors

- **vLance.vn:** Headquartered in Hanoi, vLance is the largest local freelance marketplace in Vietnam, hosting over 68,000 completed projects across web development, IT, and graphic design. Despite its high volume, vLance is a completely unmanaged horizontal platform that operates on open bidding. This structure creates fierce "price-dumping" wars where freelancers compete on low cost rather than verified quality, driving away senior talent and leaving clients vulnerable to fake reviews and inconsistent project delivery.
- **freelancerViet:** A localized HR-tech platform that acts as a generalist matching gateway. Like vLance, it lacks specialized technical vetting tools and is designed for general business or marketing tasks rather than complex engineering systems.

### Unique Differentiation of the Proposed Pre-Thesis Platform

Phạm Vũ Quang's proposed platform establishes its unique value proposition by directly solving the limitations of these direct competitors:

1. **Algorithmic Transparency and Control:** Unlike Tasker or Toptal, the platform utilizes a dedicated `matching_configs` table, allowing administrators to modify matching weight variables ($w_1, w_2, w_3$, etc.) on the fly without changing a single line of backend code.
2. **Multidimensional Constraint Optimization:** It represents a complete MCDM framework that normalizes and balances technical skill similarity alongside non-technical realities like temporal availability window alignment ($c_{\text{avail}}$) and regional geo-proximity calculations ($c_{\text{loc}}$).
3. **Enterprise-Grade Decoupled Security:** Traditional horizontal platforms (like vLance) fail to secure intellectual property. The proposed platform deploys a highly secure, three-layered RBAC permission map and SHA-256 hashed refresh token families, protecting client assets while remaining lightweight enough to run without heavy infrastructure overhead.

## Mathematical and Algorithmic Foundations of Multi-Criteria Sourcing

To overcome these structural issues, this platform implements an intelligent multi-criteria service matching engine as its core feature. Technical sourcing is a complex Multi-Criteria Decision-Making (MCDM) problem, as the optimal candidate must balance several competing priorities, including technical skill, cost, availability, proximity, and historical performance.

The platform’s matching engine standardizes these diverse metrics into a single, objective score. By decoupling these weights and storing them in a dedicated `matching_configs` database table, administrators can dynamically adjust matching configurations to test and compare different matching algorithms.

```text
+-----------------------------------------------+
| Client Service Request |
| - Skill Requirements |
| - Target Budget Range |
| - Geographic Coordinates (Lat / Lng) |
| - Requested Completion Deadline |
+-----------------------------------------------+
|
v
+-----------------------------------------------+
| Dynamic Matching Config |
| - Active Weight Vector: [w_1, w_2, w_3,...] |
+-----------------------------------------------+
|
v
+-------------------------------------------------------------------------------+
| Multi-Criteria Normalization |
+-------------------------------------------------------------------------------+
| 1. Skill Compatibility (HSCR and SGI Semantic Text Embeddings) |
| 2. Availability (Binary Temporal Window Mapping) |
| 3. Cost Range (BOM and Hourly Rate Budget Overlap Calculation) |
| 4. Proximity (Haversine Distance Formula on Lat / Lng Coordinates) |
| 5. User Rating (Aggregated, Denormalized Historic Performance Data) |
+-------------------------------------------------------------------------------+
|
v
+-------------------------------------------------------------------------------+
| Weighted Score Synthesis (MCDM) |
| |
| S_i = sum( w_j * X_ij' ) |
| |
| Evaluates candidate distance from the ideal profile using normalized values. |
+-------------------------------------------------------------------------------+
|
v
+-----------------------------------------------+
| Match Recommendation |
| - Ranked Candidate Shortlist |
| - Monthly Partitioned Audit Records |
+-----------------------------------------------+
```

To ensure fair comparison across different dimensions, all criteria are mapped to a standardized scale between 0 and 1 using min-max normalization:

$$X_{ij}' = \frac{X_{ij} - X_{\min, j}}{X_{\max, j} - X_{\min, j}}$$

Where $X_{ij}$ represents the raw performance value of candidate $i$ on criterion $j$, and $X_{\max, j}$ and $X_{\min, j}$ represent the maximum and minimum values for that criterion across the candidate pool.

The total composite score ($S_i$) for each candidate is then computed as the weighted sum of the normalized criteria:

$$S_i = \sum_{j=1}^{n} w_j X_{ij}'$$

Subject to the constraint that the weight vector must sum to exactly one:

$$\sum_{j=1}^{n} w_j = 1.0$$

The platform calculates individual scores for each of the five criteria using specific logic:

### Skill Compatibility ($c_{\text{skill}}$)

Rather than performing simple keyword matching, the platform evaluates skills using a structured taxonomy. The system calculates the Hard Skill Coverage Ratio (HSCR) and the Skill Gap Index (SGI) using semantic text embeddings and cosine similarity measures:

$$\text{Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|}$$

This model compares job requirements against candidate profiles to generate an objective skill compatibility score, ensuring highly accurate technical matching.

### Availability ($c_{\text{avail}}$)

Calculated as a binary filter and temporal metric. It verifies whether the provider's active availability window aligns with the project's requested completion deadline.

### Cost Range ($c_{\text{cost}}$)

Normalizes the overlap between the client's budget range and the provider's hourly rate limits. This calculation ensures the matching engine prioritizes cost-effective matches without relying on simple lowest-price sorting.

### Location Proximity ($c_{\text{loc}}$)

Evaluated using the Haversine formula on latitude and longitude coordinates stored in the database. This allows the database to run proximity calculations directly within SQL queries, bypassing the administrative overhead of PostGIS:

$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

Where $R$ is the Earth's radius (6371 km), $\phi_1, \phi_2$ are the latitudes, and $\Delta\lambda$ is the difference in longitude.

### User Rating ($c_{\text{rating}}$)

Leverages denormalized aggregates (`rating_average` and `rating_count`) to calculate historic performance scores. This optimizes the matching engine, preventing expensive run-time database joins during high-volume matching requests.

The system can also be configured to apply the Technique for Order Preference by Similarity to an Ideal Solution (TOPSIS). Under the TOPSIS model, candidates are ranked based on their relative geometric distance from an ideal profile (which maximizes benefit criteria) and an anti-ideal profile. To evaluate and compare different algorithmic approaches, the system compares this basic weighted model against advanced MCDM methods.

| Matching Algorithm                 | Mathematical Basis                                                      | Core Advantage                                                                    | Operational Trade-off                                                             |
| :--------------------------------- | :---------------------------------------------------------------------- | :-------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **Weighted Scoring Model**         | Linear aggregation of normalized values: $\sum w_j X_{ij}'$.            | Simple to compute, highly transparent, and easily indexable.                      | Can allow a very high score in one criterion to mask poor performance in another. |
| **TOPSIS Algorithm**               | Geometric distance from ideal ($d^+$) and anti-ideal ($d^-$) solutions. | Identifies candidates that closest match the ideal profile across all dimensions. | Higher computational complexity and slower database response times.               |
| **Ordered Weighted Average (OWA)** | Ordered sorting of criteria weights based on expert feedback.           | Highly adaptable to subjective, expert hiring scenarios.                          | Requires continuous manual adjustment of weights.                                 |
| **Grey Relational Analysis (GRA)** | Degree of relationship based on grey relational coefficients.           | Extremely effective with incomplete, uncertain, or highly complex candidate data. | Requires substantial mathematical overhead to normalize conflicting values.       |

## Systems Engineering, Secure Database Schema, and Layered Access Controls

To support this matching engine, the platform implements a secure, scalable, and highly structured technical architecture. Reliability, performance, and data security are maintained through a layered Role-Based Access Control (RBAC) model and strict database constraints.

### Granular Layered Authorization Model

The platform splits its security model into three distinct layers to ensure comprehensive coverage and prevent privilege escalation:

- **Layer 1 — Coarse Route-Level Checks:** Enforces route security using global guards (`JwtAuthGuard` and `RolesGuard`). Public routes (such as login and registration endpoints) are explicitly bypassed using a `@Public()` metadata decorator. This layer also grants implicit overrides to system administrators to prevent access blocks.
- **Layer 2 — Verb and Resource Permission Mapping:** Replaces rigid role checks with specific permission strings (such as `job:create`, `job:read:any`, `job:read:own`, `job:update:own`, `profile:update:own`, `rating:create`, `user:manage`, `system:configure`, and `dispute:resolve`). A `@RequirePermissions()` decorator paired with a `PermissionsGuard` evaluates the user's active permissions. This allows administrators to adjust role capabilities by editing a central map, eliminating the need to rewrite controller-level code.
- **Layer 3 — Fine-Grained Ownership Verification:** Resolves data security risks by verifying if a user owns the specific resource they are attempting to modify (for example, a client editing their own service request). This check is executed inside the service layer to prevent double-fetching data from the database and to maintain a clean separation of concerns.

### Relational Database Schema and Entities

The platform's relational database contains 11 core entities, structured to handle complex workflows and matching configurations.

| Table Name              | Primary Key   | Key Foreign Keys                         | Purpose and Integrity Constraints                                                                                     |
| :---------------------- | :------------ | :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **`users`**             | `id` (UUID)   | None                                     | Core identities. Stores email, role, and status (`active`, `suspended`, `deleted`). Uses soft deletes (`deleted_at`). |
| **`refresh_tokens`**    | `id` (UUID)   | `user_id`                                | Manages JWT rotation chains. Stores hashed tokens with a `family_id` to block token reuse.                            |
| **`provider_profiles`** | `id` (UUID)   | `user_id` (Unique)                       | Stores provider-specific coordinates, availability, and denormalized rating aggregates.                               |
| **`skill_categories`**  | `id` (Serial) | None                                     | Taxonometric organization of engineering disciplines (e.g., Software, Hardware).                                      |
| **`skills`**            | `id` (Serial) | `category_id`                            | Master skill table to ensure consistent skill tagging and prevent database typos.                                     |
| **`provider_skills`**   | Composite     | `profile_id`, `skill_id`                 | Many-to-many join table storing provider skills and proficiency levels (`junior` to `expert`).                        |
| **`service_requests`**  | `id` (UUID)   | `client_id`                              | Client-posted engineering tasks containing target budget, coordinates, and deadlines.                                 |
| **`matching_configs`**  | `id` (UUID)   | None                                     | Stores weight configurations, allowing administrators to modify weights without code changes.                         |
| **`match_results`**     | `id` (UUID)   | `request_id`, `provider_id`, `config_id` | Audit-logged matching recommendations. Partitioned monthly using `generated_at`.                                      |
| **`engagements`**       | `id` (UUID)   | `request_id`, `provider_id`, `client_id` | Bridge contract records. Tracks project delivery states (`pending` to `completed`).                                   |
| **`ratings`**           | `id` (UUID)   | `engagement_id`, `rater_id`, `ratee_id`  | Bidirectional feedback records. Constrained by: `CHECK (score BETWEEN 1 AND 5)`.                                      |

### Secure Token Management and Session Isolation

To maintain secure client-server sessions, the platform uses stateful JSON Web Tokens (JWT) with secure refresh token rotation. Access tokens embed the user's role and status directly in the payload, allowing the system to bypass expensive per-request database lookups.

This optimization introduces a minor 15-minute propagation delay for role updates, which is mitigated by forcing a database reread during token refresh requests. Refresh tokens are protected using SHA-256 hashing and are tied to unique family identifiers (`family_id`). If any previously rotated token in a family is reused, the system instantly invalidates the entire family to block unauthorized access.

### Explicit Lifecycle Controls and Matchability Filters

Data integrity is enforced by managing state transitions for both users and service providers. Service providers must complete a multi-step lifecycle before entering the matching pool.

Upon registration, a provider profile is created in a `draft` state. The provider must add their geographic coordinates, set their cost range, and link at least one validated skill before they can publish their profile to an `active` state. The matching engine enforces strict database filters to ensure high-quality recommendations, only matching providers who meet three conditions:

$$\text{Matchability} = (\text{profile\_status} = \text{'active'}) \land (\text{is\_available} = \text{true}) \land (\text{user\_status} = \text{'active'})$$

### Database Performance Optimization

The database schema uses strict relational constraints and soft deletes to preserve transactional history. For example, if a user account is removed, the system applies a soft delete to keep their historical ratings and aggregate statistics intact.

Conversely, cascading deletes are enabled for request-scoped records, ensuring that deleting a service request automatically cleans up associated match results. Finally, because matching audits can generate massive amounts of data over time, the `match_results` table is partitioned monthly to prevent database indexes from losing efficiency at scale.

## Localized Case Study: Applying the Platform to the Vietnamese Engineering Ecosystem

As a final localized case study, the architectural and economic models of this global engineering marketplace can be applied directly to the Vietnamese technology landscape. Vietnam serves as an exceptional testbed for an engineering services platform due to its fast-growing digital economy, robust technical workforce, and active regional technology hubs.

### Rapid Expansion of Vietnam's IT Services Sector

The Vietnamese IT services and engineering outsourcing market is experiencing rapid growth, driven by digital transformation and strong international investments.

- Vietnam's IT services market was valued at USD 2.37 billion in 2025.
- The market is projected to reach USD 2.63 billion in 2026, and is on track to scale to USD 4.39 billion by 2031, growing at a compound annual growth rate (CAGR) of 10.82%.
- The IT outsourcing segment represents the largest portion of this market, commanding a 39.05% share.
- Cloud and platform services are the fastest-growing technology segment, expanding at a CAGR of 11.86%.
- Large enterprises generate 67.72% of current market demand, while Small and Medium Enterprises (SMEs) are the fastest-growing buyer segment, expanding at a CAGR of 12.74%.
- Among industry verticals, the Banking, Financial Services, and Insurance (BFSI) sector represents the largest buyer, accounting for 26.55% of total revenue.
- Healthcare and Life Sciences is the fastest-growing vertical, projected to grow at a CAGR of 12.15%.

### Scale, Growth, and Density of the Tech Talent Pool

Vietnam possesses a young, highly skilled, and rapidly expanding engineering workforce. The country features approximately 73,800 active digital technology firms and an IT labor force of 1.26 million professionals. Within this workforce, there are between 530,000 and 560,000 specialized software developers. The nation’s education system produces 55,000 to 60,000 new tech graduates annually from over 400 universities and specialized training centers.

The government has set a target to produce 80,000 to 100,000 ICT graduates annually by 2030, with at least 15% specializing in advanced fields such as Artificial Intelligence and semiconductor design. This young, highly adaptable talent pool—with 58% of developers under 30—allows companies to quickly build and deploy modern engineering teams.

### Strategic Shift from Cost Arbitrage to High-Tech Partnerships

While Vietnam remains highly competitive on price, the market is shifting from simple cost savings to high-value, strategic technology partnerships. Prominent global technology firms are increasingly relying on Vietnamese engineers for high-stakes research and development.

For example, FPT signed a USD 200 million partnership with NVIDIA to build a local AI factory powered by H100 GPUs, while Samsung partnered with CMC Global in a USD 1 billion data center deal. These major investments show that Vietnam is quickly moving up the global value chain, establishing itself as a regional hub for cloud infrastructure, cybersecurity, and platform engineering.

### Strategic Advantage of Regional Talent Hubs

Vietnam's engineering talent is concentrated across three primary delivery hubs, each offering unique advantages for localized platform deployment:

- **Ho Chi Minh City (55% of the IT Labor Force):** The primary commercial and technology engine of Vietnam, supported by major tech parks such as Quang Trung Software City and Saigon Hi-Tech Park. This city is home to Vietnam National University, Ho Chi Minh City – International University, where this pre-thesis is registered. Deploying the platform here provides direct access to a dense ecosystem of tech start-ups, digital enterprises, and high-quality software engineering freshers.
- **Hanoi (35% of the IT Labor Force):** The political capital and a leading center for deep-tech research and development. Backed by a USD 24 million government-supported venture capital fund, Hanoi-based firms focus heavily on advanced fields such as AI algorithms, system architecture, and semiconductor design. This makes it an ideal testing ground for validating the platform's advanced skill matching models on highly specialized profiles.
- **Da Nang (Emerging Third Hub):** Rapidly developing as the most cost-effective hub for distributed engineering teams in Southeast Asia. Da Nang provides an excellent environment to test the platform's location proximity and cost optimization matching models, balancing cost advantages against regional engineering capacity.

### Competitive Developer Compensation

Vietnam offers a highly attractive balance of world-class technical skills and competitive developer compensation.

| Country / Sourcing Region | Average Monthly Developer Salary | Percentage Savings Relative to Western / East Asian Hubs  |
| :------------------------ | :------------------------------- | :-------------------------------------------------------- |
| **Vietnam**               | USD 284                          | Baseline (Highly competitive).                            |
| **India**                 | USD 396                          | Vietnam offers ~28% savings relative to Indian rates.     |
| **China**                 | USD 1,161                        | Vietnam offers ~75% savings relative to Chinese rates.    |
| **Philippines**           | USD 1,620                        | Vietnam offers ~82% savings relative to Philippine rates. |

These competitive rates allow global buyers to achieve 50% to 70% cost savings compared to Western markets, and 15% to 30% savings compared to Indian developer rates, depending on the role. These significant cost advantages, combined with a highly stable geopolitical environment, position Vietnam as an exceptional validation market for an engineering service marketplace.

By applying this intelligent marketplace platform within Vietnam, the country's engineering talent can be matched with global demands more efficiently. Resolving issues of poor skill validation, lack of developer continuity, and high transaction costs allows the platform to serve as a key catalyst, helping Vietnam's engineering sector transition from a low-cost outsourcing destination into a high-value, strategic technology partner.

## Strategic Conclusions and Recommendations

The comprehensive analysis conducted in this report demonstrates a clear academic, technical, and commercial justification for the **Digital Marketplace Platform for Engineering Services with Intelligent Multi-Criteria Service Matching**.

The global Engineering Services Outsourcing market is expanding rapidly, projected to reach between USD 5.79 trillion and USD 14.77 trillion by 2033. This massive growth is driven by severe talent shortages and rising cost pressures across major industries.

However, generic freelance marketplaces fail to support specialized engineering work due to several key weaknesses:

1. Inconsistent work quality and inflated rating systems.
2. High commission fees that eat into cost savings.
3. High-friction screening processes that turn off top talent.
4. High security, compliance, and intellectual property risks.

Phạm Vũ Quang's pre-thesis project directly addresses these systemic failures. By implementing a secure client-server platform with a three-layered RBAC model and stateful JWT token rotation, the platform guarantees data security, resource isolation, and operational reliability.

Furthermore, by replacing simple search queries with an intelligent, weighted multi-criteria matching engine (incorporating skills compatibility, availability, cost, proximity, and rating aggregates), the platform ensures highly accurate technical matches while reducing overhead and trial-and-error costs.

Using Vietnam's fast-growing tech sector—especially the high-density tech hubs of Ho Chi Minh City, Hanoi, and Da Nang—as a localized case study provides an exceptional validation strategy. Vietnam's large technical workforce, highly competitive developer rates, and rapid shift toward strategic research and development partnerships make it the ideal testbed to validate and refine the platform's matching algorithms.

This combination of commercial demand, algorithmic innovation, and secure technical architecture makes the proposed platform a highly valuable and necessary solution for the modern global engineering ecosystem.
