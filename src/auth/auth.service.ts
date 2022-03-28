import { Injectable } from '@nestjs/common';
import { connect, utils } from 'near-api-js';

const DAO_ID = 'dev-1635510732093-17387698050424';

const TESTNET_CONFIG = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
  headers: {},
  keyStore: 'no' as any,
};

@Injectable()
export class AuthService {
  async validateUser(
    accountId: string,
    message: string,
    signature: number[],
  ): Promise<any> {
    const near = await connect(TESTNET_CONFIG);
    const account = await near.account(accountId);
    const keys = await account.getAccessKeys();

    const roketoPublicKeys = keys
      .filter((key) => {
        const { permission } = key.access_key;

        return (
          typeof permission !== 'string' &&
          permission.FunctionCall.receiver_id === DAO_ID
        );
      })
      .map((key) => key.public_key);

    const Uint8Message = Buffer.from(message);
    const Uint8Signature = Uint8Array.from(signature);

    const verified = roketoPublicKeys.some((key) => {
      const publicKey = utils.PublicKey.from(key);
      return publicKey.verify(Uint8Message, Uint8Signature);
    });

    if (verified) {
      return { accountId };
    }

    return null;
  }
}
