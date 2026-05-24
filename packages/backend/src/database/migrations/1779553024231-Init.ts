import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1779553024231 implements MigrationInterface {
  name = "Migrations1779553024231";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."todo_status_enum" AS ENUM('todo', 'pending', 'in-progress', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "todo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "title" character varying(100) NOT NULL, "description" text NOT NULL, "status" "public"."todo_status_enum" NOT NULL DEFAULT 'todo', CONSTRAINT "PK_d429b7114371f6a35c5cb4776a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d429b7114371f6a35c5cb4776a" ON "todo" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "hello-world" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_d6bf7fe917fdc588c413b0ab7d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d6bf7fe917fdc588c413b0ab7d" ON "hello-world" ("id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d6bf7fe917fdc588c413b0ab7d"`,
    );
    await queryRunner.query(`DROP TABLE "hello-world"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d429b7114371f6a35c5cb4776a"`,
    );
    await queryRunner.query(`DROP TABLE "todo"`);
    await queryRunner.query(`DROP TYPE "public"."todo_status_enum"`);
  }
}
