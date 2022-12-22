import {MigrationInterface, QueryRunner} from "typeorm";

export class StreamsToNft1671452293694 implements MigrationInterface {
    name = 'StreamsToNft1671452293694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "nft_stream" ("streamId" character varying NOT NULL, "accountId" character varying NOT NULL, "receiverId" character varying NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "finishedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "payload" json NOT NULL DEFAULT '{}', CONSTRAINT "PK_9d18ca5dc712a3dc06709c221a2" PRIMARY KEY ("streamId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_563a4cf934a0aa04c687775514" ON "nft_stream" ("accountId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7b50595ca50ecade51d242b0a4" ON "nft_stream" ("receiverId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7b50595ca50ecade51d242b0a4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_563a4cf934a0aa04c687775514"`);
        await queryRunner.query(`DROP TABLE "nft_stream"`);
    }

}
