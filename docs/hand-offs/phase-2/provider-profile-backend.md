# Phase 2 Hand-off: Provider Profile — Backend

**Date:** 2026-05-25
**Scope:** `packages/backend/src/modules/provider-profile/`, `packages/backend/src/modules/skills/`, `packages/backend/src/database/migrations/`, `packages/backend/src/database/seeds/`, `packages/shared/types/src/`
**Reference:** `docs/product-specs/data-model.md`, `docs/hand-offs/phase-2/provider-profile-frontend.md`

---

## What's Built

Two new NestJS modules (`provider-profile`, `skills`) backed by one migration and one seed. The `PermissionsGuard` and `JwtAuthGuard` are already wired globally in `app.module.ts` — no guard changes needed, only `@RequirePermissions()` decorators on endpoints.

---

## 1. Migration — `AddUserFieldsAndProviderProfileTables`

**File:** `src/database/migrations/<timestamp>-AddUserFieldsAndProviderProfileTables.ts`

Generate via:

```bash
yarn workspace @ems-portal/backend migration:generate \
  src/database/migrations/AddUserFieldsAndProviderProfileTables
```

### Changes

**`users` table — add columns:**

| Column              | Type                                   | Notes                 |
| ------------------- | -------------------------------------- | --------------------- |
| `status`            | `ENUM('active','suspended','deleted')` | DEFAULT `'active'`    |
| `deleted_at`        | `TIMESTAMPTZ`                          | NULLABLE; soft delete |
| `email_verified_at` | `TIMESTAMPTZ`                          | NULLABLE              |
| `last_login_at`     | `TIMESTAMPTZ`                          | NULLABLE              |

**New type:** `CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'suspended', 'deleted')`

**New tables (in dependency order):**

```sql
CREATE TABLE "skill_categories" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(50) NOT NULL,
  CONSTRAINT "UQ_skill_categories_name" UNIQUE ("name")
);

CREATE TABLE "skills" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "category_id" integer NOT NULL,
  CONSTRAINT "UQ_skills_name" UNIQUE ("name"),
  CONSTRAINT "FK_skills_category" FOREIGN KEY ("category_id")
    REFERENCES "skill_categories"("id") ON DELETE RESTRICT
);

CREATE TABLE "provider_profiles" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now(),
  "user_id" uuid NOT NULL,
  "bio" text,
  "latitude" numeric(9,6),
  "longitude" numeric(9,6),
  "is_available" boolean NOT NULL DEFAULT true,
  "hourly_rate_min" numeric(12,2),
  "hourly_rate_max" numeric(12,2),
  "rating_average" numeric(3,2) NOT NULL DEFAULT 0,
  "rating_count" integer NOT NULL DEFAULT 0,
  "completed_engagements_count" integer NOT NULL DEFAULT 0,
  "verification_status" VARCHAR(20) NOT NULL DEFAULT 'unverified',
  "verified_at" TIMESTAMPTZ,
  CONSTRAINT "PK_provider_profiles" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_provider_profiles_user_id" UNIQUE ("user_id"),
  CONSTRAINT "FK_provider_profiles_user"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT
);

CREATE TABLE "provider_skills" (
  "profile_id" uuid NOT NULL,
  "skill_id" integer NOT NULL,
  "level" VARCHAR(10) NOT NULL,
  "years_of_experience" integer NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_provider_skills" PRIMARY KEY ("profile_id", "skill_id"),
  CONSTRAINT "FK_provider_skills_profile"
    FOREIGN KEY ("profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_provider_skills_skill"
    FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE
);
```

**Indexes:**

```sql
CREATE INDEX "IDX_skills_category_id" ON "skills" ("category_id");
CREATE INDEX "IDX_provider_skills_skill_id" ON "provider_skills" ("skill_id");
CREATE INDEX "IDX_users_role" ON "users" ("role")
  WHERE "role" = 'service_provider';  -- partial index for matching
```

**`down()` must reverse in reverse order:** DROP `provider_skills`, `provider_profiles`, `skills`, `skill_categories`; DROP columns from `users`; DROP `user_status_enum`.

---

## 2. Shared Types — New Schemas

**File:** `packages/shared/types/src/provider-profile/provider-profile.schema.ts` (new)

```ts
import { z } from "zod";
import { BaseSchema } from "../base.schema";

export const VERIFICATION_STATUS_VALUES = [
  "unverified",
  "pending",
  "verified",
] as const;
export const PROFICIENCY_LEVEL_VALUES = [
  "junior",
  "mid",
  "senior",
  "expert",
] as const;

export const VerificationStatusSchema = z.enum(VERIFICATION_STATUS_VALUES);
export const ProficiencyLevelSchema = z.enum(PROFICIENCY_LEVEL_VALUES);
export type ProficiencyLevel = z.infer<typeof ProficiencyLevelSchema>;

export const SkillCategorySchema = z.object({
  id: z.number().int(),
  name: z.string().max(50),
});
export type SkillCategory = z.infer<typeof SkillCategorySchema>;

export const SkillSchema = z.object({
  id: z.number().int(),
  name: z.string().max(100),
  categoryId: z.number().int(),
});
export type Skill = z.infer<typeof SkillSchema>;

export const ProviderSkillSchema = z.object({
  skillId: z.number().int(),
  level: ProficiencyLevelSchema,
  yearsOfExperience: z.number().int().min(0),
  createdAt: z.coerce.date(),
});
export type ProviderSkill = z.infer<typeof ProviderSkillSchema>;

export const ProviderProfileSchema = BaseSchema.extend({
  userId: z.string().uuid(),
  bio: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  isAvailable: z.boolean(),
  hourlyRateMin: z.number().nullable(),
  hourlyRateMax: z.number().nullable(),
  ratingAverage: z.number(),
  ratingCount: z.number().int(),
  completedEngagementsCount: z.number().int(),
  verificationStatus: VerificationStatusSchema,
  verifiedAt: z.coerce.date().nullable(),
  skills: z.array(ProviderSkillSchema).optional(),
});
export type ProviderProfile = z.infer<typeof ProviderProfileSchema>;

export const CreateProviderProfileSchema = z.object({
  bio: z.string().max(1000).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  isAvailable: z.boolean().optional(),
  hourlyRateMin: z.number().positive().nullable().optional(),
  hourlyRateMax: z.number().positive().nullable().optional(),
});
export type CreateProviderProfile = z.infer<typeof CreateProviderProfileSchema>;

export const UpdateProviderProfileSchema = CreateProviderProfileSchema;
export type UpdateProviderProfile = CreateProviderProfile;

export const AddProviderSkillSchema = z.object({
  skillId: z.number().int().positive(),
  level: ProficiencyLevelSchema,
  yearsOfExperience: z.number().int().min(0).default(0),
});
export type AddProviderSkill = z.infer<typeof AddProviderSkillSchema>;
```

**Update `src/auth/auth.schema.ts`:**
Add to `UserSchema`:

```ts
status: z.enum(["active", "suspended", "deleted"]).optional(),
emailVerifiedAt: z.coerce.date().nullable().optional(),
lastLoginAt: z.coerce.date().nullable().optional(),
```

**Update `src/index.ts`:** export all new schemas/types from `provider-profile/provider-profile.schema.ts`.

---

## 3. Module: `skills`

**Location:** `src/modules/skills/`

### Directory Layout

```
src/modules/skills/
├── skills.module.ts
├── skills.controller.ts
├── skills.service.ts
├── skills.repository.ts
├── dto/
│   └── skills.dto.ts
└── entities/
    ├── skill-category.entity.ts
    └── skill.entity.ts
```

### Entities

**`entities/skill-category.entity.ts`**

```ts
@Entity({ name: "skill_categories" })
export class SkillCategoryEntity implements SkillCategory {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ length: 50, unique: true })
  public name: string;
}
```

**`entities/skill.entity.ts`**

```ts
@Entity({ name: "skills" })
export class SkillEntity implements Skill {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ length: 100, unique: true })
  public name: string;

  @Column({ name: "category_id" })
  public categoryId: number;

  @ManyToOne(() => SkillCategoryEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "category_id" })
  public category: SkillCategoryEntity;
}
```

### DTOs (`dto/skills.dto.ts`)

```ts
export class SkillCategoryDto extends createZodDto(SkillCategorySchema) {}
export class SkillDto extends createZodDto(SkillSchema) {}
```

### Repository

One `skills.repository.ts` covering both entities (both are read-only catalog queries):

```ts
@Injectable()
export class SkillsRepository {
  // Two TypeORM repos injected; covers both entities
  findAllCategories(): Promise<SkillCategoryEntity[]>;
  findSkillsByCategoryId(categoryId?: number): Promise<SkillEntity[]>;
  findSkillsByIds(ids: number[]): Promise<SkillEntity[]>;
}
```

### Service

```ts
@Injectable()
export class SkillsService {
  getCategories(): Promise<SkillCategory[]>;
  getSkills(categoryId?: number): Promise<Skill[]>;
  getSkillsByIds(ids: number[]): Promise<Skill[]>; // used by provider-profile service
}
```

### Controller — Endpoints

Both endpoints are public (no auth required for catalog access):

| Method | Path                 | Guard       | Permission | Returns                             |
| ------ | -------------------- | ----------- | ---------- | ----------------------------------- |
| `GET`  | `/skills/categories` | `@Public()` | —          | `SkillCategory[]`                   |
| `GET`  | `/skills`            | `@Public()` | —          | `Skill[]` (optional `?categoryId=`) |

```ts
@ApiTags("Skills")
@Controller("skills")
export class SkillsController {
  @Get("categories")
  @Public()
  getCategories(): Promise<SkillCategoryDto[]>

  @Get()
  @Public()
  getSkills(@Query("categoryId") categoryId?: number): Promise<SkillDto[]>
}
```

---

## 4. Module: `provider-profile`

**Location:** `src/modules/provider-profile/`

### Directory Layout

```
src/modules/provider-profile/
├── provider-profile.module.ts
├── provider-profile.controller.ts
├── provider-profile.service.ts
├── provider-profile.repository.ts
├── provider-profile.constants.ts
├── dto/
│   └── provider-profile.dto.ts
└── entities/
    ├── provider-profile.entity.ts
    └── provider-skill.entity.ts
```

### Entities

**`entities/provider-profile.entity.ts`**

```ts
@Entity({ name: "provider_profiles" })
export class ProviderProfileEntity
  extends BaseEntity
  implements ProviderProfile
{
  @Column({ name: "user_id", type: "uuid" })
  public userId: string;

  @Column({ type: "text", nullable: true })
  public bio: string | null;

  @Column({ type: "numeric", precision: 9, scale: 6, nullable: true })
  public latitude: number | null;

  @Column({ type: "numeric", precision: 9, scale: 6, nullable: true })
  public longitude: number | null;

  @Column({ name: "is_available", default: true })
  public isAvailable: boolean;

  @Column({
    name: "hourly_rate_min",
    type: "numeric",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  public hourlyRateMin: number | null;

  @Column({
    name: "hourly_rate_max",
    type: "numeric",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  public hourlyRateMax: number | null;

  @Column({
    name: "rating_average",
    type: "numeric",
    precision: 3,
    scale: 2,
    default: 0,
  })
  public ratingAverage: number;

  @Column({ name: "rating_count", default: 0 })
  public ratingCount: number;

  @Column({ name: "completed_engagements_count", default: 0 })
  public completedEngagementsCount: number;

  @Column({ name: "verification_status", length: 20, default: "unverified" })
  public verificationStatus: "unverified" | "pending" | "verified";

  @Column({ name: "verified_at", type: "timestamptz", nullable: true })
  public verifiedAt: Date | null;

  @ManyToOne(() => UserEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  public user: UserEntity;

  @OneToMany(() => ProviderSkillEntity, (ps) => ps.profile, { cascade: true })
  public providerSkills: ProviderSkillEntity[];
}
```

**`entities/provider-skill.entity.ts`**

```ts
@Entity({ name: "provider_skills" })
export class ProviderSkillEntity {
  @PrimaryColumn({ name: "profile_id", type: "uuid" })
  public profileId: string;

  @PrimaryColumn({ name: "skill_id", type: "integer" })
  public skillId: number;

  @Column({ length: 10 })
  public level: ProficiencyLevel;

  @Column({ name: "years_of_experience", default: 0 })
  public yearsOfExperience: number;

  @CreateDateColumn({ name: "created_at" })
  public createdAt: Date;

  @ManyToOne(() => ProviderProfileEntity, (p) => p.providerSkills, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "profile_id" })
  public profile: ProviderProfileEntity;

  @ManyToOne(() => SkillEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "skill_id" })
  public skill: SkillEntity;
}
```

Note: `ProviderSkillEntity` does not extend `BaseEntity` — it has a composite PK and only `created_at`.

### DTOs (`dto/provider-profile.dto.ts`)

```ts
// Wire DTOs — HTTP boundary, Swagger + Zod validation
export class CreateProviderProfileDto extends createZodDto(
  CreateProviderProfileSchema,
) {}
export class UpdateProviderProfileDto extends createZodDto(
  UpdateProviderProfileSchema,
) {}
export class ProviderProfileDto extends createZodDto(ProviderProfileSchema) {}
export class AddProviderSkillDto extends createZodDto(AddProviderSkillSchema) {}

// Internal service input — scoped to module, never crosses the wire
export type CreateProfileInput = CreateProviderProfile & { userId: string };
```

### Repository

```ts
@Injectable()
export class ProviderProfileRepository extends Repository<ProviderProfileEntity> {
  findByUserId(userId: string): Promise<ProviderProfileEntity | null>;
  // Eager-loads providerSkills relation

  findByUserIdOrFail(userId: string): Promise<ProviderProfileEntity>;
  // Throws EntityNotFoundError (→ 404 via TypeOrmExceptionFilter)

  addSkill(
    profileId: string,
    dto: AddProviderSkill,
  ): Promise<ProviderSkillEntity>;
  // Upsert-safe: conflict on (profile_id, skill_id) updates level + years

  removeSkill(profileId: string, skillId: number): Promise<void>;
  // Soft-fail if row doesn't exist
}
```

### Service

```ts
@Injectable()
export class ProviderProfileService {
  getOwnProfile(userId: string): Promise<ProviderProfile>;
  // @throws NotFoundException if no profile exists for this user

  getProfileByUserId(userId: string): Promise<ProviderProfile>;
  // Public read — same query, same 404 semantics

  createProfile(input: CreateProfileInput): Promise<ProviderProfile>;
  // @throws ConflictException if profile already exists for userId

  updateProfile(
    userId: string,
    dto: UpdateProviderProfile,
  ): Promise<ProviderProfile>;
  // @throws NotFoundException if no profile exists

  addSkill(userId: string, dto: AddProviderSkill): Promise<ProviderSkill>;
  // @throws NotFoundException if no profile or if skillId doesn't exist

  removeSkill(userId: string, skillId: number): Promise<void>;
  // @throws NotFoundException if no profile exists
}
```

### Controller — Endpoints

All routes are under `@Controller("provider-profiles")`. Both guards are active globally — only `@RequirePermissions()` and `@CurrentUser()` needed here.

| Method   | Path                                    | Permission                    | Description                                  |
| -------- | --------------------------------------- | ----------------------------- | -------------------------------------------- |
| `POST`   | `/provider-profiles`                    | `provider_profile:create:own` | Create own profile (provider only)           |
| `GET`    | `/provider-profiles/me`                 | _(auth only, no perm check)_  | Read own profile with skills                 |
| `PATCH`  | `/provider-profiles/me`                 | `provider_profile:update:own` | Update own profile                           |
| `GET`    | `/provider-profiles/:userId`            | `provider_profile:read:any`   | Read any provider's profile (client + admin) |
| `POST`   | `/provider-profiles/me/skills`          | `provider_profile:update:own` | Add a skill to own profile                   |
| `DELETE` | `/provider-profiles/me/skills/:skillId` | `provider_profile:update:own` | Remove a skill from own profile              |

```ts
@ApiTags("Provider Profiles")
@Controller("provider-profiles")
export class ProviderProfileController {

  @Post()
  @RequirePermissions("provider_profile:create:own")
  @HttpCode(201)
  create(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateProviderProfileDto,
  ): Promise<ProviderProfileDto>

  @Get("me")
  @HttpCode(200)
  getMe(@CurrentUser() user: UserEntity): Promise<ProviderProfileDto>

  @Patch("me")
  @RequirePermissions("provider_profile:update:own")
  updateMe(
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateProviderProfileDto,
  ): Promise<ProviderProfileDto>

  @Get(":userId")
  @RequirePermissions("provider_profile:read:any")
  getByUserId(@Param("userId") userId: string): Promise<ProviderProfileDto>

  @Post("me/skills")
  @RequirePermissions("provider_profile:update:own")
  @HttpCode(201)
  addSkill(
    @CurrentUser() user: UserEntity,
    @Body() dto: AddProviderSkillDto,
  ): Promise<ProviderSkillSchema>

  @Delete("me/skills/:skillId")
  @RequirePermissions("provider_profile:update:own")
  @HttpCode(204)
  removeSkill(
    @CurrentUser() user: UserEntity,
    @Param("skillId", ParseIntPipe) skillId: number,
  ): Promise<void>
}
```

**Order matters:** `GET /provider-profiles/me` must be registered before `GET /provider-profiles/:userId` so Fastify's router matches `me` literally before treating it as a param.

---

## 5. Seeds

**File:** `src/database/seeds/02-skills.seed.ts`

Seeds `skill_categories` and `skills` using upsert on name. Initial data:

```
Categories: Network, Software
Skills:
  Network: TCP/IP Fundamentals, Network Configuration, Firewall Management,
           VPN Setup, Network Security, Cloud Networking
  Software: Node.js, React, TypeScript, Python, PostgreSQL, Docker
```

**File:** `src/database/seeds/03-provider-profiles.seed.ts`

Creates a `provider_profiles` row for the `provider@ems.local` seed user. Attaches 3 sample skills so the profile is usable in integration tests.

---

## 6. Module Registration (`src/app.module.ts`)

Add to the `imports` array:

```ts
import { SkillsModule } from "./modules/skills/skills.module";
import { ProviderProfileModule } from "./modules/provider-profile/provider-profile.module";

// in @Module({ imports: [...] })
SkillsModule,
ProviderProfileModule,
```

---

## 7. Tests

### Unit Tests (co-located `*.spec.ts`)

**`provider-profile.service.spec.ts`:**

- `createProfile` — throws `ConflictException` on duplicate `userId`
- `getOwnProfile` — throws `NotFoundException` when repository returns null
- `addSkill` — verifies skill existence via `SkillsService` before inserting
- `removeSkill` — idempotent (no error if row absent)

**`provider-profile.controller.spec.ts`:**

- `POST /provider-profiles` with `client` role user → `@RequirePermissions` check via guard mock
- `GET /provider-profiles/me` returns service result mapped to DTO

### Integration Tests (`*.int-spec.ts`)

**`provider-profile.int-spec.ts`:**

- Authenticates as `provider@ems.local` (from seed)
- `POST /api/provider-profiles` — creates profile, asserts 201 + returned ProviderProfile shape
- `GET /api/provider-profiles/me` — asserts profile returned with skills array
- `PATCH /api/provider-profiles/me` — updates bio, asserts change persisted
- `POST /api/provider-profiles/me/skills` — adds a skill, asserts 201
- `DELETE /api/provider-profiles/me/skills/:skillId` — removes skill, asserts 204
- Authenticates as `client@ems.local`
- `GET /api/provider-profiles/:userId` — reads provider profile, asserts 200
- `POST /api/provider-profiles` as client → asserts 403
- `PATCH /api/provider-profiles/me` as client → asserts 403
- Cleanup: deletes created profile in `afterAll`

---

## 8. Gap Analysis vs Data Model

| Data Model field                                                | Status                                                                             |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `users.status`                                                  | ✅ Migration adds column; entity updated                                           |
| `users.deleted_at`                                              | ✅ Migration adds column; soft-delete pattern ready                                |
| `users.email_verified_at`                                       | ✅ Migration adds column                                                           |
| `users.last_login_at`                                           | ✅ Migration adds column                                                           |
| `provider_profiles` (all fields)                                | ✅ Entity covers all data-model columns                                            |
| `skill_categories` + `skills`                                   | ✅ Seeded with initial catalog                                                     |
| `provider_skills` composite PK                                  | ✅ Enforced at DB + entity level                                                   |
| `provider_profiles.rating_*` denormalized                       | ✅ Columns present; updated in Phase 5 when ratings land                           |
| `provider_profile:read:any` missing for `service_provider` role | ⚠️ Providers can only read own profile via `/me`; adjust RBAC if needed in Phase 4 |

---

## 9. Verification

```bash
# 1. Rebuild shared types
yarn build:types

# 2. Generate and review the migration
yarn workspace @ems-portal/backend migration:generate \
  src/database/migrations/AddUserFieldsAndProviderProfileTables

# 3. Apply migration + run seeds
docker compose up -d db
yarn workspace @ems-portal/backend migration:run
yarn workspace @ems-portal/backend seed:run

# 4. Unit tests
yarn workspace @ems-portal/backend test

# 5. Integration tests
yarn test:int

# 6. Smoke test via Swagger UI (http://localhost:3000/api/docs)
#    POST /api/auth/login as provider@ems.local
#    POST /api/provider-profiles
#    GET  /api/provider-profiles/me
#    POST /api/provider-profiles/me/skills
#    GET  /api/skills/categories
#    GET  /api/skills
```
