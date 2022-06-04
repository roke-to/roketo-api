import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFundsAddedNotifications1654376238625 implements MigrationInterface {
    name = 'AddFundsAddedNotifications1654376238625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('StreamStarted', 'StreamPaused', 'StreamFinished', 'StreamIsDue', 'StreamContinued', 'StreamCliffPassed', 'StreamFundsAdded')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum" USING "type"::"text"::"public"."notification_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum_old" AS ENUM('StreamStarted', 'StreamPaused', 'StreamFinished', 'StreamIsDue', 'StreamContinued', 'StreamCliffPassed')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum_old" USING "type"::"text"::"public"."notification_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum_old" RENAME TO "notification_type_enum"`);
    }

}
