import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskTable1737000000000 implements MigrationInterface {
  name = 'CreateTaskTable1737000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "task_status_enum" AS ENUM('pending', 'in_progress', 'done');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "task_priority_enum" AS ENUM('low', 'medium', 'high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `);
    await queryRunner.query(`
      CREATE TABLE "task" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "status" "task_status_enum" NOT NULL DEFAULT 'pending',
        "priority" "task_priority_enum" NOT NULL DEFAULT 'medium',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_task_status" ON "task" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_task_priority" ON "task" ("priority")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_task_priority"`);
    await queryRunner.query(`DROP INDEX "IDX_task_status"`);
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "task_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "task_status_enum"`);
  }
}
