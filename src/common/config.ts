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
