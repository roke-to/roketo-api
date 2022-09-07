import { OnModuleInit } from '@nestjs/common';
import { NearService } from '../near/near.service';
import type { RoketoContract } from '../common/contract.types';
export declare class ContractService implements OnModuleInit {
    private readonly nearService;
    constructor(nearService: NearService);
    contract: RoketoContract;
    onModuleInit(): Promise<void>;
    getStreams(accountId: any): Promise<import("../common/contract.types").RoketoStream[]>;
    getStream(id: any): Promise<import("../common/contract.types").RoketoStream>;
}
