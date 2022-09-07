"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserEmailVerification1655100189100 = void 0;
class AddUserEmailVerification1655100189100 {
    constructor() {
        this.name = 'AddUserEmailVerification1655100189100';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "verificationEmailSentAt" TIMESTAMP WITH TIME ZONE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verificationEmailSentAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isEmailVerified"`);
    }
}
exports.AddUserEmailVerification1655100189100 = AddUserEmailVerification1655100189100;
//# sourceMappingURL=1655100189100-AddUserEmailVerification.js.map