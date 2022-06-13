import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEmailVerification1655100189100
  implements MigrationInterface
{
  name = 'AddUserEmailVerification1655100189100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "verificationEmailSentAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_68d3c22dbd95449360fdbf7a3f1" PRIMARY KEY ("accountId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_00abcf7b2089a5c05f0aedc567" ON "notification" ("accountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b0a22ff9c198efd09650ed64e9" ON "notification" ("accountId", "streamId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b0a22ff9c198efd09650ed64e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_00abcf7b2089a5c05f0aedc567"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "PK_68d3c22dbd95449360fdbf7a3f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "verificationEmailSentAt"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isEmailVerified"`);
  }
}
