import { Injectable } from '@nestjs/common';
import { connect, Contract } from 'near-api-js';

const ROKETO_CONTRACT_NAME = 'streaming-roketo.dcversus.testnet';

const TESTNET_CONFIG = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
  headers: {},
  keyStore: 'no' as any,
};

type StringInt = string;

type StreamId = string;
type AccountId = string;

type StreamStatus = 'Initialized' | 'Active' | 'Paused' | { Finished: string };

export type RoketoStream = {
  amount_to_push: StringInt;
  balance: StringInt;
  cliff?: StringInt;
  creator_id: AccountId;
  description: string;
  id: StreamId;
  is_expirable: boolean;
  is_locked: boolean;
  last_action: number;
  owner_id: AccountId;
  receiver_id: AccountId;
  status: StreamStatus;
  timestamp_created: number;
  token_account_id: AccountId;
  tokens_per_sec: StringInt;
  tokens_total_withdrawn: StringInt;
};

type ContractResponse<R> = {
  Err: never;
  Ok: R;
};

type ContractViewFunction<P, R> = (json?: P) => Promise<R>;

type StreamsProps = { account_id: string; from: number; limit: number };

export type RoketoContract = Contract & {
  get_account_incoming_streams: ContractViewFunction<
    StreamsProps,
    ContractResponse<RoketoStream[]>
  >;
};

@Injectable()
export class NearService {
  contract: RoketoContract;

  async initContract() {
    const near = await connect(TESTNET_CONFIG);
    const account = await near.account(ROKETO_CONTRACT_NAME);

    this.contract = new Contract(account, ROKETO_CONTRACT_NAME, {
      viewMethods: ['get_account_incoming_streams'],
      changeMethods: [],
    }) as RoketoContract;
  }

  async findUserPublicKeys(accountId: string): Promise<string[]> {
    const near = await connect(TESTNET_CONFIG);
    const account = await near.account(accountId);
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

  async getStreams(accountId) {
    const response = await this.contract.get_account_incoming_streams({
      account_id: accountId,
      from: 0,
      limit: 1000000,
    });

    return response.Ok;
  }
}
