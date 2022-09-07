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
exports.AuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const near_auth_guard_1 = require("./guards/near-auth.guard");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const login_dto_1 = require("./login.dto");
const bad_request_dto_1 = require("../common/dto/bad-request.dto");
const access_token_dto_1 = require("./access-token.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    login(req) {
        return this.authService.login(req.user);
    }
};
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Issues JWT for accessing all the other endpoints',
        type: access_token_dto_1.AccessTokenDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({ type: bad_request_dto_1.BadRequest }),
    openapi.ApiResponse({ status: 201, type: require("./access-token.dto").AccessTokenDto }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
AuthController = __decorate([
    (0, jwt_auth_guard_1.Public)(),
    (0, common_1.UseGuards)(near_auth_guard_1.NearAuthGuard),
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map