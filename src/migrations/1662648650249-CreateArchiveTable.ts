import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateArchiveTable1662648650249 implements MigrationInterface {
    name = 'CreateArchiveTable1662648650249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "archive" ("streamId" character varying NOT NULL, "accountId" character varying NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "finishedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "payload" json NOT NULL DEFAULT '{}', CONSTRAINT "PK_889a2249c91236f950ea2597f09" PRIMARY KEY ("streamId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e970da34b87f982fe8185d030d" ON "archive" ("accountId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e970da34b87f982fe8185d030d"`);
        await queryRunner.query(`DROP TABLE "archive"`);
    }

}
