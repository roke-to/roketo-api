"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddFundsAddedNotifications1654376238625 = void 0;
class AddFundsAddedNotifications1654376238625 {
    constructor() {
        this.name = 'AddFundsAddedNotifications1654376238625';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('StreamStarted', 'StreamPaused', 'StreamFinished', 'StreamIsDue', 'StreamContinued', 'StreamCliffPassed', 'StreamFundsAdded')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum" USING "type"::"text"::"public"."notification_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum_old"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum_old" AS ENUM('StreamStarted', 'StreamPaused', 'StreamFinished', 'StreamIsDue', 'StreamContinued', 'StreamCliffPassed')`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum_old" USING "type"::"text"::"public"."notification_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum_old" RENAME TO "notification_type_enum"`);
    }
}
exports.AddFundsAddedNotifications1654376238625 = AddFundsAddedNotifications1654376238625;
//# sourceMappingURL=1654376238625-AddFundsAddedNotifications.js.map