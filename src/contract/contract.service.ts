import { Injectable, OnModuleInit } from '@nestjs/common';
import { Contract } from 'near-api-js';

import { NearService } from '../near/near.service';
import { ROKETO_CONTRACT_NAME } from '../common/config';
import type { RoketoContract } from '../common/contract.types';

@Injectable()
export class ContractService implements OnModuleInit {
  constructor(private readonly nearService: NearService) {}

  contract: RoketoContract;

  async onModuleInit() {
    const account = await this.nearService.getAccount(ROKETO_CONTRACT_NAME);

    this.contract = new Contract(account, ROKETO_CONTRACT_NAME, {
      viewMethods: ['get_account_incoming_streams'],
      changeMethods: [],
    }) as RoketoContract;
  }

  async getStreams(accountId) {
    const response = await this.contract.get_account_incoming_streams({
      account_id: accountId,
      from: 0,
      limit: 1000000,
    });

    return response.Ok;
  }
}
