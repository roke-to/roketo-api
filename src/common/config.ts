export const ROKETO_CONTRACT_NAME = process.env.ROKETO_CONTRACT_NAME;

export const NEAR_CONFIG = {
  networkId: process.env.NEAR_NETWORK_ID,
  nodeUrl: process.env.NEAR_NODE_URL,
  walletUrl: process.env.NEAR_WALLET_URL,
  headers: {},
  keyStore: 'no' as any,
};

// TODO: Replace with something idk yet, maybe generate randomly at startup?
export const JWT_SECRET = 'secretKey2';

export const API_HOST =
  process.env.NEAR_NETWORK_ID === 'mainnet'
    ? 'https://api.roke.to'
    : 'https://api.test.roke.to';

export const DAPP_HOST =
  process.env.NEAR_NETWORK_ID === 'mainnet'
    ? 'https://app2.roke.to'
    : 'https://app2.test.roke.to';
