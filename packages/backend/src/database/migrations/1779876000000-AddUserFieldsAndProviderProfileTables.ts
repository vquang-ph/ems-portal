import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserFieldsAndProviderProfileTables1779876000000 implements MigrationInterface {
  name = "AddUserFieldsAndProviderProfileTables1779876000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_status_enum type
    await queryRunner.query(
      `CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'suspended', 'deleted')`,
    );

    // Add columns to users table
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" "public"."user_status_enum" NOT NULL DEFAULT 'active'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email_verified_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_login_at" TIMESTAMP WITH TIME ZONE`,
    );

    // Create skill_categories table
    await queryRunner.query(
      `CREATE TABLE "skill_categories" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, CONSTRAINT "PK_skill_categories" PRIMARY KEY ("id"), CONSTRAINT "UQ_skill_categories_name" UNIQUE ("name"))`,
    );

    // Create skills table
    await queryRunner.query(
      `CREATE TABLE "skills" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_skills" PRIMARY KEY ("id"), CONSTRAINT "UQ_skills_name" UNIQUE ("name"), CONSTRAINT "FK_skills_category" FOREIGN KEY ("category_id") REFERENCES "skill_categories"("id") ON DELETE RESTRICT)`,
    );

    // Create provider_profiles table
    await queryRunner.query(
      `CREATE TABLE "provider_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "user_id" uuid NOT NULL, "bio" text, "latitude" numeric(9,6), "longitude" numeric(9,6), "is_available" boolean NOT NULL DEFAULT true, "hourly_rate_min" numeric(12,2), "hourly_rate_max" numeric(12,2), "rating_average" numeric(3,2) NOT NULL DEFAULT '0', "rating_count" integer NOT NULL DEFAULT 0, "completed_engagements_count" integer NOT NULL DEFAULT 0, "verification_status" character varying(20) NOT NULL DEFAULT 'unverified', "verified_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_provider_profiles" PRIMARY KEY ("id"), CONSTRAINT "UQ_provider_profiles_user_id" UNIQUE ("user_id"), CONSTRAINT "FK_provider_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT)`,
    );

    // Create provider_skills table
    await queryRunner.query(
      `CREATE TABLE "provider_skills" ("profile_id" uuid NOT NULL, "skill_id" integer NOT NULL, "level" character varying(10) NOT NULL, "years_of_experience" integer NOT NULL DEFAULT 0, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_provider_skills" PRIMARY KEY ("profile_id", "skill_id"), CONSTRAINT "FK_provider_skills_profile" FOREIGN KEY ("profile_id") REFERENCES "provider_profiles"("id") ON DELETE CASCADE, CONSTRAINT "FK_provider_skills_skill" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE)`,
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_skills_category_id" ON "skills" ("category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_provider_skills_skill_id" ON "provider_skills" ("skill_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_role" ON "users" ("role") WHERE "role" = 'service_provider'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes in reverse order
    await queryRunner.query(`DROP INDEX "public"."IDX_users_role"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_provider_skills_skill_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_skills_category_id"`);

    // Drop tables in reverse dependency order
    await queryRunner.query(`DROP TABLE "provider_skills"`);
    await queryRunner.query(`DROP TABLE "provider_profiles"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP TABLE "skill_categories"`);

    // Drop columns from users table
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "email_verified_at"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);

    // Drop user_status_enum type
    await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
  }
}
