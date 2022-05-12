import { Injectable } from '@nestjs/common';
import { connect } from 'near-api-js';

import { NEAR_CONFIG, ROKETO_CONTRACT_NAME } from '../common/config';

@Injectable()
export class NearService {
  async getAccount(accountId: string) {
    const near = await connect(NEAR_CONFIG);
    return near.account(accountId);
  }

  async findUserPublicKeys(accountId: string): Promise<string[]> {
    const account = await this.getAccount(accountId);
    const allAccessKeys = await account.getAccessKeys();

    return allAccessKeys
      .filter(function getRoketoKeys(key) {
        const { permission } = key.access_key;

        return (
          typeof permission !== 'string' &&
          permission.FunctionCall.receiver_id === ROKETO_CONTRACT_NAME
        );
      })
      .map((key) => key.public_key);
  }
}
