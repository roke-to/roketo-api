import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pool } from 'pg';

import { UserFt } from './entitites/userFT.entity';
import { UserNft } from './entitites/userNFT.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TokensService {
  private readonly pool = new Pool({
    connectionString:
      'postgres://public_readonly:nearprotocol@testnet.db.explorer.indexer.near.dev/testnet_explorer',
  });

  constructor(
    @InjectRepository(UserFt)
    private readonly userFTRepository: Repository<UserFt>,
    @InjectRepository(UserNft)
    private readonly userNFTRepository: Repository<UserNft>,
  ) {}

  async getTokens(accountId: string) {
    const userFTs = await this.userFTRepository.preload({
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

    const updatedUserFTs = plainToInstance(UserFt, {
      accountId,
      list: mergedList,
      blockTimestamp: lastBlockTimestamp,
    });

    await this.userFTRepository.save(updatedUserFTs);

    return updatedUserFTs.list;
  }

  async getNFTs(accountId: string) {
    const userNFTs = await this.userNFTRepository.preload({
      accountId,
    });

    const blockTimestamp = Number(userNFTs?.blockTimestamp ?? '0');

    const { lastBlockTimestamp, list } = await this.findlikelyNFTsFromBlock(
      accountId,
      blockTimestamp,
    );

    const mergedList = userNFTs
      ? Array.from(new Set([...userNFTs.list, ...list]))
      : list;

    const updatedUserNFTs = plainToInstance(UserNft, {
      accountId,
      list: mergedList,
      blockTimestamp: lastBlockTimestamp,
    });

    await this.userNFTRepository.save(updatedUserNFTs);

    return updatedUserNFTs.list;
  }

  private async findLastBlockByTimestamp() {
    const {
      rows: [lastBlock],
    } = await this.pool.query(
      'select block_timestamp FROM blocks ORDER BY block_timestamp DESC LIMIT 1',
    );
    return lastBlock;
  }

  private async findlikelyNFTsFromBlock(
    accountId: string,
    fromBlockTimestamp: number,
  ) {
    const { block_timestamp: lastBlockTimestamp } =
      await this.findLastBlockByTimestamp();

      const ownershipChangeFunctionCalls = `
          select distinct receipt_receiver_account_id as receiver_account_id, events.token_id as token_id
          from action_receipt_actions
          join assets__non_fungible_token_events as events on emitted_by_contract_account_id = $1
          where args->'args_json'->>'receiver_id' = $1
              and action_kind = 'FUNCTION_CALL'
              and args->>'args_json' is not null
              and args->>'method_name' like 'nft_%'
              and receipt_included_in_block_timestamp <= $2
              and receipt_included_in_block_timestamp > $3
      `;
  
      const ownershipChangeEvents = `
          select distinct emitted_by_contract_account_id as receiver_account_id, token_id
          from assets__non_fungible_token_events
          where token_new_owner_account_id = $1
              and emitted_at_block_timestamp <= $2
              and emitted_at_block_timestamp > $3
      `;

      const { rows } = await this.pool.query(
        [ownershipChangeFunctionCalls, ownershipChangeEvents].join(
          ' union '
        ), 
        [
          accountId, 
          lastBlockTimestamp, 
          fromBlockTimestamp
        ]);

      return {
        lastBlockTimestamp: Number(lastBlockTimestamp),
        list: rows.map(({ receiver_account_id, token_id }) => {
          return {
            receiver_account_id, 
            token_id
          }
        }),
      };
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

    const { rows } = await this.pool.query(
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

    return {
      lastBlockTimestamp: Number(lastBlockTimestamp),
      list: rows.map(({ receiver_account_id }) => receiver_account_id),
    };
  }
}
