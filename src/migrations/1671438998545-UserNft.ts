import {MigrationInterface, QueryRunner} from "typeorm";

export class UserNft1671438998545 implements MigrationInterface {
    name = 'UserNft1671438998545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_ft" ("accountId" character varying NOT NULL, "list" json NOT NULL, "blockTimestamp" character varying NOT NULL, CONSTRAINT "PK_390f63674844e12659bbf82af66" PRIMARY KEY ("accountId"))`);
        await queryRunner.query(`CREATE TABLE "user_nft" ("accountId" character varying NOT NULL, "list" json NOT NULL, "blockTimestamp" character varying NOT NULL, CONSTRAINT "PK_a990ae994f0f493fba9a5c0c3a9" PRIMARY KEY ("accountId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_nft"`);
        await queryRunner.query(`DROP TABLE "user_ft"`);
    }

}
