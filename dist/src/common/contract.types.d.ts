import type { Contract } from 'near-api-js';
declare type StringInt = string;
declare type StreamId = string;
declare type AccountId = string;
export declare enum StringStreamStatus {
    Initialized = "Initialized",
    Active = "Active",
    Paused = "Paused"
}
declare type StreamStatus = StringStreamStatus | {
    Finished: string;
};
export declare type RoketoStream = {
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
    status: StreamStatus;
    timestamp_created: number;
    token_account_id: AccountId;
    tokens_per_sec: StringInt;
    tokens_total_withdrawn: StringInt;
    wasDue?: true;
    hasPassedCliff?: true;
};
declare type ContractResponse<R> = {
    Err: never;
    Ok: R;
} & R;
declare type ContractViewFunction<P, R> = (json?: P) => Promise<R>;
declare type StreamsProps = {
    account_id: string;
    from: number;
    limit: number;
};
export declare type RoketoContract = Contract & {
    get_stream: ContractViewFunction<{
        stream_id: string;
    }, ContractResponse<RoketoStream>>;
    get_account_incoming_streams: ContractViewFunction<StreamsProps, ContractResponse<RoketoStream[]>>;
    get_account_outgoing_streams: ContractViewFunction<StreamsProps, ContractResponse<RoketoStream[]>>;
};
export {};
