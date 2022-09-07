"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAllowNotificationsColumn1655116756970 = void 0;
class AddAllowNotificationsColumn1655116756970 {
    constructor() {
        this.name = 'AddAllowNotificationsColumn1655116756970';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "allowNotifications" boolean NOT NULL DEFAULT true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "allowNotifications"`);
    }
}
exports.AddAllowNotificationsColumn1655116756970 = AddAllowNotificationsColumn1655116756970;
//# sourceMappingURL=1655116756970-AddAllowNotificationsColumn.js.map