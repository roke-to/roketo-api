import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAllowNotificationsColumn1655116756970
  implements MigrationInterface
{
  name = 'AddAllowNotificationsColumn1655116756970';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "allowNotifications" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "allowNotifications"`,
    );
  }
}
