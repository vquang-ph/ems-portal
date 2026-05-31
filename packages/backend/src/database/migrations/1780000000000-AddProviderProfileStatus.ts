import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProviderProfileStatus1780000000000 implements MigrationInterface {
  name = "AddProviderProfileStatus1780000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add profile_status column with draft default.
    await queryRunner.query(
      `ALTER TABLE "provider_profiles" ADD "profile_status" character varying(20) NOT NULL DEFAULT 'draft'`,
    );

    // Existing rows predate the lifecycle and were manually populated
    // (seeds, hand-inserted records). Treat them as already published.
    await queryRunner.query(
      `UPDATE "provider_profiles" SET "profile_status" = 'active'`,
    );

    // Flip is_available default for new rows: stubs should not be matchable
    // until the provider explicitly opts in. Existing rows keep their value.
    await queryRunner.query(
      `ALTER TABLE "provider_profiles" ALTER COLUMN "is_available" SET DEFAULT false`,
    );

    // Backfill stub profiles for any pre-existing service_provider users
    // that never had a row inserted (the pre-fix 404 case).
    await queryRunner.query(`
      INSERT INTO "provider_profiles" (
        "id", "user_id", "is_available",
        "rating_average", "rating_count", "completed_engagements_count",
        "verification_status", "profile_status"
      )
      SELECT
        uuid_generate_v4(), u."id", false,
        0, 0, 0,
        'unverified', 'draft'
      FROM "users" u
      LEFT JOIN "provider_profiles" p ON p."user_id" = u."id"
      WHERE u."role" = 'service_provider' AND p."id" IS NULL
    `);

    // Partial index for the matching hot path: candidates are those
    // simultaneously published AND available.
    await queryRunner.query(
      `CREATE INDEX "IDX_provider_profiles_active" ON "provider_profiles" ("profile_status") WHERE "profile_status" = 'active'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_provider_profiles_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_profiles" ALTER COLUMN "is_available" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "provider_profiles" DROP COLUMN "profile_status"`,
    );
  }
}
