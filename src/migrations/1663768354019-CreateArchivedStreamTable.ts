import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateArchivedStreamTable1663768354019 implements MigrationInterface {
    name = 'CreateArchivedStreamTable1663768354019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "archived_stream" ("streamId" character varying NOT NULL, "accountId" character varying NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "finishedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "payload" json NOT NULL DEFAULT '{}', CONSTRAINT "PK_f19ab30c6d08dcabdbc77347d86" PRIMARY KEY ("streamId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bded29831d23e338eb8d24f73b" ON "archived_stream" ("accountId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_bded29831d23e338eb8d24f73b"`);
        await queryRunner.query(`DROP TABLE "archived_stream"`);
    }

}
