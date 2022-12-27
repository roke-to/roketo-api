import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Pool } from 'pg';
import { Connection, Repository } from 'typeorm';

import { plainToInstance } from 'class-transformer';
import { RoketoStream, StringStreamStatus } from 'src/common/stream.dto';

import { UsersService } from 'src/users/users.service';
import { NftStream } from './entities/nft_stream.entity';
import { VAULT_CONTRACT_NAME, INDEXER_DB_URL } from 'src/common/config';

@Injectable()
export class NftStreamsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly connection: Connection,
    @InjectRepository(NftStream)
    private readonly nftStreamsRepository: Repository<NftStream>,
  ) {}

  private readonly pool = new Pool({
    connectionString: INDEXER_DB_URL,
  });

  isBusy = false;

  private readonly logger = new Logger('Cron');
  
  async findAll(accountId: string) {
    return await this.nftStreamsRepository.find({
      where: [
        { accountId },
        { receiverId: accountId }
      ],
      order: { startedAt: 'DESC' },
      take: 100,
    });
  }

  private getData() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(
          this.findAllNftTransactions()
        );
      }, 5000);
    });
  }
  
  private timeoutAfter(seconds: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("request timed-out"));
      }, seconds * 1000);
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async findTransactionsToNftIfNotBusy() {
    if (this.isBusy) {
      this.logger.log('Busy processing streams to NFT, skipped.');
      return;
    }
    const start = Date.now();
    try {
      this.isBusy = true;
      this.logger.log('Starting processing streams to NFT...');

      await Promise.race(
        [this.timeoutAfter(60), this.getData()]
      );

      this.logger.log(
        `Finished processing streams to NFT in ${Date.now() - start}ms.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed processing streams to NFT after ${Date.now() - start}ms.`,
        `URL: ${INDEXER_DB_URL}`,
        error.message,
        error.stack,
      );
    } finally {
      this.isBusy = false;
    }
  }

  async findAllNftTransactions() {
    const users = await this.usersService.findAll();
    
    let usersIds = [];
    users.map((user) => {
      usersIds.push(user.accountId)
    })
    
    const currentStreams = await this.getStreamsToNFT(
      usersIds,
    );

    await this.processUserStreams(currentStreams);
  }

  async processUserStreams(currentStreams) {
    let queryRunner;

    const streams = await Promise.all(
      currentStreams.map(async (stream: RoketoStream) => {

        return plainToInstance(
          NftStream,
          {
            streamId: stream.id,
            accountId: stream.owner_id,
            receiverId: stream.receiver_id,
            startedAt: new Date(stream.timestamp_created / 1000000),
            finishedAt: new Date(stream.last_action / 1000000),
            payload: {stream: stream}
          }
        )
      })
    );
    
    try {
      queryRunner = this.connection.createQueryRunner();
      await queryRunner.startTransaction();

      await Promise.all([
        queryRunner.manager.save(NftStream, streams)
      ]);

      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(e);
      this.logger.error(`Error while processing streams to nft of`);

      await queryRunner?.rollbackTransaction();
    } finally {
      await queryRunner?.release();
    }
  }

  private async findNFTsOwner(
    nftId: string,
    token_id: string,
  ) {
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

  async getStreamsToNFT(accountIds: Array<string>): Promise<RoketoStream[]> {
    const query = `
        SELECT action_receipt_actions.*, execution_outcomes.*, receipts.* FROM action_receipt_actions 
          JOIN execution_outcomes ON execution_outcomes.receipt_id = action_receipt_actions.receipt_id
          LEFT JOIN receipts ON execution_outcomes.receipt_id = receipts.receipt_id
          WHERE action_receipt_actions.receipt_receiver_account_id IN ($1)
            AND action_receipt_actions.args->'args_json'->>'sender_id' = $2
            AND action_receipt_actions.action_kind = 'FUNCTION_CALL'
            AND action_receipt_actions.args->>'args_json' is not null
            AND execution_outcomes.status = 'SUCCESS_VALUE' 
      `;

    const { rows } = await this.pool.query(query, [VAULT_CONTRACT_NAME, accountIds.toString()]);
  
    const roketoStreams = await Promise.all(
      rows.map(async (stream: any) => {
        const parsedMsg = JSON.parse(JSON.parse(`"${stream.args.args_json.msg}"`));
  
        const nftOwner = await this.findNFTsOwner(parsedMsg.nft_contract_id, parsedMsg.nft_id);
  
        return plainToInstance(
          RoketoStream,
          {
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
          }
        )
      })
    );

    return roketoStreams;
  }
}
