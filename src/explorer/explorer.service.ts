import { Injectable } from '@nestjs/common';
import { Connection, getConnection, createConnection, MoreThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';

import { ActionReceiptActions } from './ActionReceiptActions.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';

const EACH_MINUTE = '0 */1 * * * *';

@Injectable()
export class ExplorerService {
  constructor(private readonly notificationsService: NotificationsService) {}

  isParsing = false;

  async getDBConnection(): Promise<Connection> {
    const NAME = 'explorer';

    let connection: Connection;

    try {
      connection = await getConnection(NAME).connect();
      console.log('Got existing explorer connection.');
    } catch (e) {
      connection = await createConnection({
        name: NAME,
        type: 'postgres',
        url: 'postgres://public_readonly:nearprotocol@testnet.db.explorer.indexer.near.dev/testnet_explorer',
        entities: [ActionReceiptActions],
      });
      console.log('Established new explorer connection.');
    }

    return connection;
  }

  toNotificationDto(
    actionReceiptAction: ActionReceiptActions,
  ): CreateNotificationDto | undefined {
    try {
      const msg = actionReceiptAction.args?.args_json?.msg;

      if (!msg) {
        return;
      }

      const { receipt_id, receipt_included_in_block_timestamp } =
        actionReceiptAction;

      const command = JSON.parse(msg.replaceAll('\\', ''));

      if (typeof command === 'object' && 'Create' in command) {
        const { receiver_id, ...payload } = command.Create.request;

        return {
          id: receipt_id,
          accountId: receiver_id,
          type: NotificationType.StreamCreated,
          createdAt: receipt_included_in_block_timestamp,
          payload,
        };
      }
    } catch (e) {
      // Ignore errors likely caused by JSON.parse.
    }
  }

  @Cron(EACH_MINUTE)
  async parseExplorer() {
    if (this.isParsing) {
      console.log('Another parsing is in progress.');

      return;
    }

    this.isParsing = true;

    console.log('Parsing started.');

    const [timestamp, connection] = await Promise.all([
      this.notificationsService.getLatestTimestamp(),
      this.getDBConnection(),
    ]);

    try {
      const repository =
        connection.getRepository<ActionReceiptActions>(ActionReceiptActions);

      const ACTION_RECEIPT_ACTIONS_FROM_LAST_TIMESTAMP = {
        where: {
          receipt_receiver_account_id: 'streaming-roketo.dcversus.testnet',
          receipt_included_in_block_timestamp: MoreThan(timestamp),
        },
      };

      const actionReceiptActions = await repository.find(
        ACTION_RECEIPT_ACTIONS_FROM_LAST_TIMESTAMP,
      );

      if (actionReceiptActions.length === 0) {
        console.log('Nothing to parse.');

        return;
      }

      const newNotificationsDtos = actionReceiptActions
        .map(this.toNotificationDto)
        .filter(Boolean);

      this.notificationsService.createMany(newNotificationsDtos);

      console.log('Parsing finished.');
    } catch (e) {
      console.log('Parsing error:', e);
    } finally {
      await connection.close();

      this.isParsing = false;
    }
  }
}
