"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NearService = void 0;
const common_1 = require("@nestjs/common");
const near_api_js_1 = require("near-api-js");
const config_1 = require("../common/config");
let NearService = class NearService {
    async getAccount(accountId) {
        const near = await (0, near_api_js_1.connect)(config_1.NEAR_CONFIG);
        return near.account(accountId);
    }
    async findUserPublicKeys(accountId) {
        const account = await this.getAccount(accountId);
        const allAccessKeys = await account.getAccessKeys();
        return allAccessKeys
            .filter(function getRoketoKeys(key) {
            const { permission } = key.access_key;
            return (typeof permission !== 'string' &&
                permission.FunctionCall.receiver_id === config_1.ROKETO_CONTRACT_NAME);
        })
            .map((key) => key.public_key);
    }
};
NearService = __decorate([
    (0, common_1.Injectable)()
], NearService);
exports.NearService = NearService;
//# sourceMappingURL=near.service.js.map