"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const contract_module_1 = require("../contract/contract.module");
const users_module_1 = require("../users/users.module");
const archive_module_1 = require("./../archive/archive.module");
const notifications_controller_1 = require("./notifications.controller");
const notifications_service_1 = require("./notifications.service");
const notification_entity_1 = require("./notification.entity");
const config_1 = require("../common/config");
let NotificationsModule = class NotificationsModule {
};
NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([notification_entity_1.Notification]),
            jwt_1.JwtModule.register({
                secret: config_1.JWT_SECRET,
            }),
            users_module_1.UsersModule,
            contract_module_1.ContractModule,
            archive_module_1.ArchiveModule,
        ],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [notifications_service_1.NotificationsService],
    })
], NotificationsModule);
exports.NotificationsModule = NotificationsModule;
//# sourceMappingURL=notifications.module.js.map