"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("./auth.service");
const near_strategy_1 = require("./strategies/near.strategy");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const auth_controller_1 = require("./auth.controller");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const users_module_1 = require("../users/users.module");
const near_module_1 = require("../near/near.module");
const config_1 = require("../common/config");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: config_1.JWT_SECRET,
                signOptions: { expiresIn: '1 hour' },
            }),
            users_module_1.UsersModule,
            near_module_1.NearModule,
        ],
        providers: [
            auth_service_1.AuthService,
            near_strategy_1.NearStrategy,
            jwt_strategy_1.JwtStrategy,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
        controllers: [auth_controller_1.AuthController],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map