import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Pool, Query } from 'pg';
import { Connection, Repository } from 'typeorm';

import { plainToInstance } from 'class-transformer';
import { RoketoStream, StringStreamStatus } from 'src/common/stream.dto';

import { UsersService } from 'src/users/users.service';
import { NftStream } from 'src/nft_streams/entities/nft_stream.entity';
import { VAULT_CONTRACT_NAME, INDEXER_DB_URL } from 'src/common/config';
import { UserNft } from 'src/tokens/entitites/userNFT.entity';
import { UserFt } from 'src/tokens/entitites/userFT.entity';

const submit = Query.prototype.submit;

Query.prototype.submit = function () {
  const text = this.text;
  const values = this.values || [];
  const query = text.replace(/\$([0-9]+)/g, (m, v) =>
    JSON.stringify(values[parseInt(v) - 1]).replace(/"/g, "'"),
  );
  console.log(query);
  // eslint-disable-next-line prefer-rest-params
  submit.apply(this, arguments);
};

@Injectable()
export class IndexerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly connection: Connection,
    @InjectRepository(UserFt)
    private readonly userFTRepository: Repository<UserFt>,
    @InjectRepository(UserNft)
    private readonly userNFTRepository: Repository<UserNft>,
  ) {}

  private readonly pool = new Pool({
    connectionString: INDEXER_DB_URL,
    log: (msg) => console.log(msg),
  });

  isBusy = false;

  private readonly logger = new Logger('Cron');

  // Transactions to NFT
  private getNftTransactionsData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.findAllNftTransactions());
      }, 5000);
    });
  }

  private nftTransactionsTimeout(seconds: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('request timed-out'));
      }, seconds * 1000);
    });
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  private async findTransactionsToNftIfNotBusy() {
    if (this.isBusy) {
      this.logger.log('Busy processing streams to NFT, skipped.');
      return;
    }
    const start = Date.now();
    try {
      this.isBusy = true;
      this.logger.log('Starting processing streams to NFT...');

      await Promise.race([
        this.nftTransactionsTimeout(60),
        this.getNftTransactionsData(),
      ]);

      this.logger.log(
        `Finished processing streams to NFT in ${Date.now() - start}ms.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed processing streams to NFT after ${Date.now() - start}ms.`,
        error.message,
        error.stack,
      );
    } finally {
      this.isBusy = false;
    }
  }

  async findAllNftTransactions() {
    const users = await this.usersService.findAll();

    const usersIds: any[] = [];
    users.map((user) => {
      usersIds.push(user.accountId);
    });

    const currentStreams = await this.getTransactionsToNFT(usersIds);

    await this.processUserStreams(currentStreams);
  }

  async processUserStreams(currentStreams) {
    let queryRunner;

    const streams = await Promise.all(
      currentStreams.map(async (stream: RoketoStream) => {
        return plainToInstance(NftStream, {
          streamId: stream.id,
          accountId: stream.owner_id,
          receiverId: stream.receiver_id,
          startedAt: new Date(stream.timestamp_created / 1000000),
          finishedAt: new Date(stream.last_action / 1000000),
          payload: { stream: stream },
        });
      }),
    );

    try {
      queryRunner = this.connection.createQueryRunner();
      await queryRunner.startTransaction();

      await Promise.all([queryRunner.manager.save(NftStream, streams)]);

      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(e);
      this.logger.error(`Error while processing streams to nft of`);

      await queryRunner?.rollbackTransaction();
    } finally {
      await queryRunner?.release();
    }
  }

  private async findNFTsOwner(nftId: string, token_id: string) {
    const ownershipChangeEvents = `
          SELECT token_new_owner_account_id AS owner_id
          FROM assets__non_fungible_token_events
          WHERE emitted_by_contract_account_id = $1
              AND token_id = $2
          ORDER BY emitted_at_block_timestamp DESC LIMIT 1
      `;

    const { rows } = await this.pool.query(ownershipChangeEvents, [
      nftId,
      token_id,
    ]);

    return rows[0].owner_id;
  }

  async getTransactionsToNFT(
    accountIds: Array<string>,
  ): Promise<RoketoStream[]> {
    const escapedAccounts = accountIds
      .filter(Boolean)
      .map((account) => `'${account}'`)
      .join(', ');
    const query = `
        SELECT action_receipt_actions.*, execution_outcomes.*, receipts.* FROM action_receipt_actions 
          JOIN execution_outcomes ON execution_outcomes.receipt_id = action_receipt_actions.receipt_id
          LEFT JOIN receipts ON execution_outcomes.receipt_id = receipts.receipt_id
          WHERE action_receipt_actions.receipt_receiver_account_id = $1
            AND action_receipt_actions.args->'args_json'->>'sender_id' IN (${escapedAccounts})
            AND action_receipt_actions.action_kind = 'FUNCTION_CALL'
            AND action_receipt_actions.args->>'args_json' is not null
            AND execution_outcomes.status = 'SUCCESS_VALUE' 
      `;

    const { rows } = await this.pool.query(query, [VAULT_CONTRACT_NAME]);

    const roketoStreams = await Promise.all(
      rows.map(async (stream: any) => {
        const parsedMsg = JSON.parse(
          JSON.parse(`"${stream.args.args_json.msg}"`),
        );

        const nftOwner = await this.findNFTsOwner(
          parsedMsg.nft_contract_id,
          parsedMsg.nft_id,
        );

        return plainToInstance(RoketoStream, {
          balance: stream.args.args_json.amount || '',
          creator_id: stream.receipt_receiver_account_id || null,
          description: stream.args.args_json.msg,
          id: stream.originated_from_transaction_hash || '',
          is_expirable: true,
          is_locked: false,
          last_action: stream.executed_in_block_timestamp || null,
          owner_id: stream.receipt_receiver_account_id,
          receiver_id: nftOwner,
          status: StringStreamStatus.Initialized,
          timestamp_created: stream.executed_in_block_timestamp || null,
          token_account_id: stream.receipt_predecessor_account_id || null,
          tokens_per_sec: '',
          tokens_total_withdrawn: '',
        });
      }),
    );

    return roketoStreams;
  }

  // Get user to FT

  private getFtData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.findAllFt());
      }, 5000);
    });
  }

  private ftTimeout(seconds: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('request timed-out'));
      }, seconds * 1000);
    });
  }
  @Cron(CronExpression.EVERY_MINUTE)
  private async findAllFtIfNotBusy() {
    if (this.isBusy) {
      this.logger.log('Busy processing list of FTs, skipped.');
      return;
    }
    const start = Date.now();
    try {
      this.isBusy = true;

      this.logger.log('Starting processing list of FTs...');

      await Promise.race([this.ftTimeout(60), this.getFtData()]);

      this.logger.log(
        `Finished processing list of FTs in ${Date.now() - start}ms.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed processing list of FTs after ${Date.now() - start}ms.`,
        error.message,
        error.stack,
      );
    } finally {
      this.isBusy = false;
    }
  }

  async findAllFt() {
    const users = await this.usersService.findAll();

    await Promise.all(
      users.map(async (user) => {
        await this.getTokens(user.accountId);
      }),
    );
  }

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

  // Get user to NFT
  private async findAllNftIfNotBusy() {
    if (this.isBusy) {
      this.logger.log('Busy processing list of NFTs, skipped.');
      return;
    }
    const start = Date.now();
    try {
      this.isBusy = true;

      this.logger.log('Starting processing list of NFTs...');

      await this.findAllNft();

      this.logger.log(
        `Finished processing list of NFTs in ${Date.now() - start}ms.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed processing list of NFTs after ${Date.now() - start}ms.`,
        error.message,
        error.stack,
      );
    } finally {
      this.isBusy = false;
    }
  }

  async findAllNft() {
    const users = await this.usersService.findAll();

    await Promise.all(
      users.map(async (user) => {
        await this.getNFTs(user.accountId);
      }),
    );
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
          select distinct receipt_receiver_account_id as nft_contract_id, events.token_id as token_id
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
          select distinct emitted_by_contract_account_id as nft_contract_id, token_id
          from assets__non_fungible_token_events
          where token_new_owner_account_id = $1
              and emitted_at_block_timestamp <= $2
              and emitted_at_block_timestamp > $3
      `;

    const { rows } = await this.pool.query(
      [ownershipChangeFunctionCalls, ownershipChangeEvents].join(' union '),
      [accountId, lastBlockTimestamp, fromBlockTimestamp],
    );

    return {
      lastBlockTimestamp: Number(lastBlockTimestamp),
      list: rows.map(({ nft_contract_id, token_id }) => {
        return {
          nft_contract_id,
          token_id,
        };
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
