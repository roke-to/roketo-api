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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const unauthorized_dto_1 = require("../common/dto/unauthorized.dto");
const update_user_dto_1 = require("./update-user.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const config_1 = require("../common/config");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    findOne(accountId, req) {
        if (req.user.accountId !== accountId) {
            throw new common_1.ForbiddenException();
        }
        return this.usersService.findOne(accountId);
    }
    async update(accountId, req, body) {
        if (req.user.accountId !== accountId) {
            throw new common_1.ForbiddenException();
        }
        if (Object.keys(body).length === 0) {
            throw new common_1.BadRequestException();
        }
        await this.usersService.update(accountId, body);
    }
    async getAvatarUrl(accountId, res) {
        const url = await this.usersService.getAvatarUrl(accountId);
        return res.redirect(common_1.HttpStatus.TEMPORARY_REDIRECT, url);
    }
    async verifyEmail(accountId, jwt, res) {
        await this.usersService.verifyEmail(accountId, jwt);
        res.redirect(common_1.HttpStatus.FOUND, config_1.DAPP_HOST);
    }
    async resendVerificationEmail(accountId, req) {
        if (req.user.accountId !== accountId) {
            throw new common_1.ForbiddenException();
        }
        return await this.usersService.resendVerificationEmail(accountId);
    }
};
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(':accountId'),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: unauthorized_dto_1.Unauthorized }),
    openapi.ApiResponse({ status: 200, type: require("./user.entity").User }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':accountId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: unauthorized_dto_1.Unauthorized }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, jwt_auth_guard_1.Public)(),
    (0, common_1.Get)(':accountId/avatar'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAvatarUrl", null);
__decorate([
    (0, jwt_auth_guard_1.Public)(),
    (0, common_1.Get)(':accountId/verifyEmail/:jwt'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Param)('jwt')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "verifyEmail", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':accountId/verifyEmail'),
    (0, swagger_1.ApiUnauthorizedResponse)({ type: unauthorized_dto_1.Unauthorized }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resendVerificationEmail", null);
UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map