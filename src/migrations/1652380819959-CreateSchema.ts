import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchema1652383174463 implements MigrationInterface {
  name = 'CreateSchema1652383174463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notification_type_enum" AS ENUM('StreamStarted', 'StreamPaused', 'StreamFinished', 'StreamIsDue', 'StreamContinued')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountId" character varying NOT NULL, "streamId" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "type" "public"."notification_type_enum" NOT NULL, "payload" json NOT NULL DEFAULT '{}', CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_00abcf7b2089a5c05f0aedc567" ON "notification" ("accountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b0a22ff9c198efd09650ed64e9" ON "notification" ("accountId", "streamId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("accountId" character varying NOT NULL, "name" character varying, "email" character varying, "streams" json, CONSTRAINT "PK_68d3c22dbd95449360fdbf7a3f1" PRIMARY KEY ("accountId"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b0a22ff9c198efd09650ed64e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_00abcf7b2089a5c05f0aedc567"`,
    );
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
  }
}
