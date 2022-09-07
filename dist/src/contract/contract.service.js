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
exports.ContractService = void 0;
const common_1 = require("@nestjs/common");
const near_api_js_1 = require("near-api-js");
const near_service_1 = require("../near/near.service");
const config_1 = require("../common/config");
let ContractService = class ContractService {
    constructor(nearService) {
        this.nearService = nearService;
    }
    async onModuleInit() {
        const account = await this.nearService.getAccount(config_1.ROKETO_CONTRACT_NAME);
        this.contract = new near_api_js_1.Contract(account, config_1.ROKETO_CONTRACT_NAME, {
            viewMethods: [
                'get_stream',
                'get_account_incoming_streams',
                'get_account_outgoing_streams',
            ],
            changeMethods: [],
        });
    }
    async getStreams(accountId) {
        const params = {
            account_id: accountId,
            from: 0,
            limit: 500,
        };
        try {
            const [incomingResponse, outgoingResponse] = await Promise.all([
                this.contract.get_account_incoming_streams(params),
                this.contract.get_account_outgoing_streams(params),
            ]);
            return [
                ...(incomingResponse.Ok || incomingResponse || []),
                ...(outgoingResponse.Ok || outgoingResponse || []),
            ];
        }
        catch (error) {
            if (!(error instanceof near_api_js_1.providers.TypedError) ||
                !error.message.match(/\bUnreachableAccount\b/) ||
                !error.message.match(new RegExp(String.raw `\b${accountId}\b`))) {
                console.error(error);
            }
            return null;
        }
    }
    async getStream(id) {
        const streamResponse = await this.contract.get_stream({ stream_id: id });
        return streamResponse.Ok || streamResponse;
    }
};
ContractService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [near_service_1.NearService])
], ContractService);
exports.ContractService = ContractService;
//# sourceMappingURL=contract.service.js.map