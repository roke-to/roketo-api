import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserFTs1663688207845 implements MigrationInterface {
  name = 'UserFTs1663688207845';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_f_ts" ("accountId" character varying NOT NULL, "list" json NOT NULL, "blockTimestamp" character varying NOT NULL, CONSTRAINT "PK_154c765ef1672694bc1014f8cac" PRIMARY KEY ("accountId"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_f_ts"`);
  }
}
