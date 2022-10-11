import type { Contract } from 'near-api-js';

import { RoketoStream } from './stream.dto';

type ContractResponse<R> = {
  Err: never;
  Ok: R;
} & R;

type ContractViewFunction<P, R> = (json?: P) => Promise<R>;

type StreamsProps = { account_id: string; from: number; limit: number };

export type RoketoContract = Contract & {
  get_stream: ContractViewFunction<
    { stream_id: string },
    ContractResponse<RoketoStream>
  >;
  get_account_incoming_streams: ContractViewFunction<
    StreamsProps,
    ContractResponse<RoketoStream[]>
  >;
  get_account_outgoing_streams: ContractViewFunction<
    StreamsProps,
    ContractResponse<RoketoStream[]>
  >;
};
