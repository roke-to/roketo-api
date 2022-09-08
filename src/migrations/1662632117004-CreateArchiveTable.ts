import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateArchiveTable1662632117004 implements MigrationInterface {
    name = 'CreateArchiveTable1662632117004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "archive" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountId" character varying NOT NULL, "streamId" character varying NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "finishedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "payload" json NOT NULL DEFAULT '{}', CONSTRAINT "PK_6493b19677ebfecfcf5281f4233" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e970da34b87f982fe8185d030d" ON "archive" ("accountId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7cb96fff8de836b41a2f0eb660" ON "archive" ("accountId", "streamId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7cb96fff8de836b41a2f0eb660"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e970da34b87f982fe8185d030d"`);
        await queryRunner.query(`DROP TABLE "archive"`);
    }

}
