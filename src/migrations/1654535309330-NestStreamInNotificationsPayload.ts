import { MigrationInterface, QueryRunner } from 'typeorm';

export class NestStreamInNotificationsPayload1654535309330
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE notification
      SET payload = json_build_object('stream', payload)
      WHERE type <> 'StreamFundsAdded'`,
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
