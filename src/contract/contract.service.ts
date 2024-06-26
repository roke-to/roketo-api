import { Injectable, OnModuleInit } from '@nestjs/common';
import { Contract, providers } from 'near-api-js';

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
      viewMethods: [
        'get_stream',
        'get_account_incoming_streams',
        'get_account_outgoing_streams',
      ],
      changeMethods: [],
    }) as RoketoContract;
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
    } catch (error) {
      if (
        !(error instanceof providers.TypedError) ||
        !error.message.match(/\bUnreachableAccount\b/) ||
        !error.message.match(new RegExp(String.raw`\b${accountId}\b`))
      ) {
        console.error(error);
      }

      return null;
    }
  }

  async getStream(id) {
    const streamResponse = await this.contract.get_stream({ stream_id: id });

    return streamResponse.Ok || streamResponse;
  }
}
