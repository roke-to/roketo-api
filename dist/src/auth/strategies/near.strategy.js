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
exports.NearStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_custom_1 = require("passport-custom");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const auth_service_1 = require("../auth.service");
const login_dto_1 = require("../login.dto");
let NearStrategy = class NearStrategy extends (0, passport_1.PassportStrategy)(passport_custom_1.Strategy, 'near') {
    constructor(authService) {
        super();
        this.authService = authService;
    }
    async validate(req) {
        const loginDto = (0, class_transformer_1.plainToInstance)(login_dto_1.LoginDto, req.body);
        const errors = (0, class_validator_1.validateSync)(loginDto, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });
        if (errors.length > 0) {
            throw new common_1.BadRequestException(errors.flatMap((error) => Object.values(error.constraints)));
        }
        const user = await this.authService.validateUser(loginDto);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
};
NearStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], NearStrategy);
exports.NearStrategy = NearStrategy;
//# sourceMappingURL=near.strategy.js.map