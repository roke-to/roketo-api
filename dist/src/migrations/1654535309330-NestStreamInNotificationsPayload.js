"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestStreamInNotificationsPayload1654535309330 = void 0;
class NestStreamInNotificationsPayload1654535309330 {
    async up(queryRunner) {
        await queryRunner.query(`UPDATE notification
      SET payload = json_build_object('stream', payload)
      WHERE type <> 'StreamFundsAdded'`);
    }
    async down() {
        return;
    }
}
exports.NestStreamInNotificationsPayload1654535309330 = NestStreamInNotificationsPayload1654535309330;
//# sourceMappingURL=1654535309330-NestStreamInNotificationsPayload.js.map