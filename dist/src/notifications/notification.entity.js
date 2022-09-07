"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.NotificationType = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
var NotificationType;
(function (NotificationType) {
    NotificationType["StreamStarted"] = "StreamStarted";
    NotificationType["StreamPaused"] = "StreamPaused";
    NotificationType["StreamFinished"] = "StreamFinished";
    NotificationType["StreamIsDue"] = "StreamIsDue";
    NotificationType["StreamContinued"] = "StreamContinued";
    NotificationType["StreamCliffPassed"] = "StreamCliffPassed";
    NotificationType["StreamFundsAdded"] = "StreamFundsAdded";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
let Notification = class Notification {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, accountId: { required: true, type: () => String }, streamId: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, isRead: { required: true, type: () => Boolean }, type: { required: true, enum: require("./notification.entity").NotificationType }, payload: { required: true, type: () => Object } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "streamId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: NotificationType }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', default: {} }),
    __metadata("design:type", Object)
], Notification.prototype, "payload", void 0);
Notification = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Index)(['accountId', 'streamId'])
], Notification);
exports.Notification = Notification;
//# sourceMappingURL=notification.entity.js.map