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
exports.ArchiveController = void 0;
const openapi = require("@nestjs/swagger");
const archive_service_1 = require("./archive.service");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ArchiveController = class ArchiveController {
    constructor(archiveService) {
        this.archiveService = archiveService;
    }
    findAll(req) {
        return this.archiveService.findAll('katherine8.testnet');
    }
};
__decorate([
    (0, jwt_auth_guard_1.Public)(),
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: [require("./archive.entity").Archive] }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ArchiveController.prototype, "findAll", null);
ArchiveController = __decorate([
    (0, common_1.Controller)('archive'),
    __metadata("design:paramtypes", [archive_service_1.ArchiveService])
], ArchiveController);
exports.ArchiveController = ArchiveController;
//# sourceMappingURL=archive.controller.js.map