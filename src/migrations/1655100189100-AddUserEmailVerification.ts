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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "verificationEmailSentAt"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isEmailVerified"`);
  }
}
