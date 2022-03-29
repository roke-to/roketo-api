import { Injectable } from '@nestjs/common';
import { connect } from 'near-api-js';

const ROKETO_DAO_ID = 'streaming-roketo.dcversus.testnet';

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
export class UsersService {
  async findUserPublicKeys(accountId: string): Promise<string[]> {
    const near = await connect(TESTNET_CONFIG);
    const account = await near.account(accountId);
    const allAccessKeys = await account.getAccessKeys();

    return allAccessKeys
      .filter(function getRoketoKeys(key) {
        const { permission } = key.access_key;

        return (
          typeof permission !== 'string' &&
          permission.FunctionCall.receiver_id === ROKETO_DAO_ID
        );
      })
      .map((key) => key.public_key);
  }
}
