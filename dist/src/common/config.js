"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAPP_HOST = exports.API_HOST = exports.JWT_SECRET = exports.NEAR_CONFIG = exports.ROKETO_CONTRACT_NAME = void 0;
exports.ROKETO_CONTRACT_NAME = process.env.ROKETO_CONTRACT_NAME;
exports.NEAR_CONFIG = {
    networkId: process.env.NEAR_NETWORK_ID,
    nodeUrl: process.env.NEAR_NODE_URL,
    walletUrl: process.env.NEAR_WALLET_URL,
    headers: {},
    keyStore: 'no',
};
exports.JWT_SECRET = 'secretKey2';
exports.API_HOST = process.env.API_HOST;
exports.DAPP_HOST = process.env.DAPP_HOST;
//# sourceMappingURL=config.js.map