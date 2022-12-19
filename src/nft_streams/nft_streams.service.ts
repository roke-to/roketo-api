import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Pool } from 'pg';
import { Connection, Repository } from 'typeorm';

import { plainToInstance } from 'class-transformer';
import { RoketoStream, StringStreamStatus } from 'src/common/stream.dto';

import { UsersService } from 'src/users/users.service';
import { NftStream } from './entities/nft_stream.entity';

const EACH_5_SECONDS = '*/5 * * * * *';

@Injectable()
export class NftStreamsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly connection: Connection,
    @InjectRepository(NftStream)
    private readonly nftStreamsRepository: Repository<NftStream>,
  ) {}

  private readonly pool = new Pool({
    connectionString:
      'postgres://public_readonly:nearprotocol@testnet.db.explorer.indexer.near.dev/testnet_explorer',
  });

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

  @Cron(EACH_5_SECONDS)
  async findAllNftTransactions() {
    const users = await this.usersService.findAll();
    await Promise.all(
      users.map(async (user) => {
        const currentStreams = await this.getStreamsToNFT(
          user.accountId,
        );

        await this.processUserStreams(user, currentStreams);
      }),
    );
  }

  async processUserStreams(user, currentStreams) {
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
      this.logger.error(`Error while processing streams to nft of ${user.accountId}`);

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
          select token_new_owner_account_id as owner_id
          from assets__non_fungible_token_events
          where emitted_by_contract_account_id = $1
              and token_id = $2
          ORDER BY emitted_at_block_timestamp DESC LIMIT 1
      `;

      const { rows } = await this.pool.query(ownershipChangeEvents, [
          nftId, 
          token_id, 
      ]);
    
    return rows[0].owner_id;
  }

  async getStreamsToNFT(accountId: string): Promise<RoketoStream[]> {
    const receiverId = 'vault.vengone.testnet';

    const query = `
        select action_receipt_actions.*, execution_outcomes.*, receipts.* from action_receipt_actions 
          JOIN execution_outcomes ON execution_outcomes.receipt_id = action_receipt_actions.receipt_id
          LEFT JOIN receipts ON execution_outcomes.receipt_id = receipts.receipt_id
          where action_receipt_actions.receipt_receiver_account_id = $1
            and action_receipt_actions.args->'args_json'->>'sender_id' = $2
            and action_receipt_actions.action_kind = 'FUNCTION_CALL'
            and action_receipt_actions.args->>'args_json' is not null
            and execution_outcomes.status = 'SUCCESS_VALUE' 
      `;

    const { rows } = await this.pool.query(query, [receiverId, accountId]);
  
    const roketoStreams = await Promise.all(
      rows.map(async (stream: any) => {
        const parsedMsg = JSON.parse(JSON.parse(`"${stream.args.args_json.msg}"`));
  
        const nftOwner = await this.findNFTsOwner(parsedMsg.nft_contract_id, parsedMsg.nft_id);
  
        return plainToInstance(
          RoketoStream,
          {
            balance: stream.args.args_json.amount || '',
            creator_id: accountId || null,
            description: stream.args.args_json.msg,
            id: stream.originated_from_transaction_hash || '',
            is_expirable: true,
            is_locked: false,
            last_action: stream.executed_in_block_timestamp || null,
            owner_id: accountId,
            receiver_id: nftOwner,
            nft_contract: parsedMsg.nft_contract_id || null,
            nft_id: parsedMsg.nft_id || null,
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
