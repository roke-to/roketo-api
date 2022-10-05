import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pool } from 'pg';

import { UserFTs } from './userFTs.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(UserFTs)
    private readonly userFTsRepository: Repository<UserFTs>,
  ) {}

  async getTokens(accountId: string) {
    const userFTs = await this.userFTsRepository.preload({
      accountId,
    });

    const blockTimestamp = Number(userFTs?.blockTimestamp ?? '0');

    const { lastBlockTimestamp, list } = await this.findLikelyTokensFromBlock(
      accountId,
      blockTimestamp,
    );

    const mergedList = userFTs
      ? Array.from(new Set([...userFTs.list, ...list]))
      : list;

    const updatedUserFTs = plainToInstance(UserFTs, {
      accountId,
      list: mergedList,
      blockTimestamp: lastBlockTimestamp,
    });

    await this.userFTsRepository.save(updatedUserFTs);

    return updatedUserFTs.list;
  }

  private async findLastBlockByTimestamp() {
    const pool = new Pool({
      connectionString:
        'postgres://public_readonly:nearprotocol@testnet.db.explorer.indexer.near.dev/testnet_explorer',
    });

    const {
      rows: [lastBlock],
    } = await pool.query(
      'select block_timestamp FROM blocks ORDER BY block_timestamp DESC LIMIT 1',
    );
    return lastBlock;
  }

  private async findLikelyTokensFromBlock(
    accountId: string,
    fromBlockTimestamp: number,
  ) {
    const { block_timestamp: lastBlockTimestamp } =
      await this.findLastBlockByTimestamp();

    const received = `
        select distinct receipt_receiver_account_id as receiver_account_id
        from action_receipt_actions
        where args->'args_json'->>'receiver_id' = $1
            and action_kind = 'FUNCTION_CALL'
            and args->>'args_json' is not null
            and args->>'method_name' in ('ft_transfer', 'ft_transfer_call','ft_mint')
            and receipt_included_in_block_timestamp <= $3
            and receipt_included_in_block_timestamp > $4
    `;

    const mintedWithBridge = `
        select distinct receipt_receiver_account_id as receiver_account_id from (
            select args->'args_json'->>'account_id' as account_id, receipt_receiver_account_id
            from action_receipt_actions
            where action_kind = 'FUNCTION_CALL' and
                receipt_predecessor_account_id = $2 and
                args->>'method_name' = 'mint'
                and receipt_included_in_block_timestamp <= $3
                and receipt_included_in_block_timestamp > $4
        ) minted_with_bridge
        where account_id = $1
    `;

    const calledByUser = `
        select distinct receipt_receiver_account_id as receiver_account_id
        from action_receipt_actions
        where receipt_predecessor_account_id = $1
            and action_kind = 'FUNCTION_CALL'
            and (args->>'method_name' like 'ft_%' or args->>'method_name' = 'storage_deposit')
            and receipt_included_in_block_timestamp <= $3
            and receipt_included_in_block_timestamp > $4
    `;

    const ownershipChangeEvents = `
        select distinct emitted_by_contract_account_id as receiver_account_id 
        from assets__fungible_token_events
        where token_new_owner_account_id = $1
            and emitted_at_block_timestamp <= $3
            and emitted_at_block_timestamp > $4
    `;

    const pool = new Pool({
      connectionString:
        'postgres://public_readonly:nearprotocol@testnet.db.explorer.indexer.near.dev/testnet_explorer',
    });

    const { rows } = await pool.query(
      [received, mintedWithBridge, calledByUser, ownershipChangeEvents].join(
        ' union ',
      ),
      [
        accountId,
        'factory.bridge.near',
        lastBlockTimestamp,
        fromBlockTimestamp,
      ],
    );

    pool.end();

    return {
      lastBlockTimestamp: Number(lastBlockTimestamp),
      list: rows.map(({ receiver_account_id }) => receiver_account_id),
    };
  }
}
