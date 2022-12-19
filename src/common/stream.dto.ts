type StringInt = string;

type StreamId = string;
type AccountId = string;

export enum StringStreamStatus {
  Initialized = 'Initialized',
  Active = 'Active',
  Paused = 'Paused',
}

export class RoketoStream {
  amount_to_push: StringInt;
  balance: StringInt;
  cliff?: number;
  creator_id: AccountId;
  description: string;
  id: StreamId;
  is_expirable: boolean;
  is_locked: boolean;
  last_action: number;
  owner_id: AccountId;
  receiver_id: AccountId;
  nft_id?: string;
  nft_contract?: string;
  status: StringStreamStatus;
  timestamp_created: number;
  token_account_id: AccountId;
  tokens_per_sec: StringInt;
  tokens_total_withdrawn: StringInt;
  wasDue?: boolean;
  hasPassedCliff?: boolean;
}
