import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';
import BigNumber from 'bignumber.js';

import { UsersService } from '../users/users.service';
import { ContractService } from '../contract/contract.service';
import { User } from '../users/user.entity';
import { RoketoStream, StringStreamStatus } from '../common/contract.types';
import { Notification, NotificationType } from './notification.entity';

const EACH_5_SECONDS = '*/5 * * * * *';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    private readonly connection: Connection,
    private readonly usersService: UsersService,
    private readonly contractService: ContractService,
  ) {}

  private readonly logger = new Logger('Cron');

  isBusy = false;

  findDueNotification(accountId: string, streamId: string) {
    return this.notificationsRepository.findOne({
      where: {
        accountId,
        streamId,
        type: NotificationType.StreamIsDue,
      },
    });
  }

  @Cron(EACH_5_SECONDS)
  private async generateIfNotBusy() {
    if (this.isBusy) {
      this.logger.log('Busy processing streams, skipped.');
      return;
    }

    const start = Date.now();
    try {
      this.isBusy = true;

      this.logger.log('Starting processing streams...');

      await this.processAllUsersStreams();

      this.logger.log(
        `Finished processing streams in ${Date.now() - start}ms.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed processing streams after ${Date.now() - start}ms.`,
        error.message,
        error.stack,
      );
    } finally {
      this.isBusy = false;
    }
  }

  private async processAllUsersStreams() {
    const users = await this.usersService.findAll();

    await Promise.all(
      users.map(async (user) => {
        const currentStreams = await this.contractService.getStreams(
          user.accountId,
        );

        await this.processUserStreams(user, currentStreams);
      }),
    );
  }

  private array2Map<T extends Record<string, any>>(
    array: T[],
    key: keyof T,
  ): Record<string, T> {
    return array.reduce((map: Record<string, T>, item) => {
      map[item[key]] = item;

      return map;
    }, {});
  }

  private async getNotification(
    accountId: string,
    previousStream?: RoketoStream,
    currentStream?: RoketoStream,
  ): Promise<
    | Pick<
        Notification,
        'accountId' | 'createdAt' | 'payload' | 'type' | 'streamId'
      >
    | undefined
  > {
    const commonData = {
      accountId,
      streamId: currentStream?.id,
      createdAt: new Date(),
      payload: currentStream,
    };

    // Refer to https://www.notion.so/kikimora-labs/ROKETO-56-Notification-s-text-ee6b873ab8a045b1af141fb707678d51
    const previousStatus = previousStream?.status;
    const currentStatus = currentStream?.status;

    if (
      currentStatus === previousStatus &&
      currentStream?.balance !== previousStream?.balance
    ) {
      return {
        ...commonData,
        payload: {
          stream: currentStream,
          fundsAdded: new BigNumber(currentStream.balance)
            .minus(previousStream.balance)
            .toFixed(),
        },
        type: NotificationType.StreamFundsAdded,
      };
    }

    if (
      (!previousStatus || previousStatus === StringStreamStatus.Initialized) &&
      currentStatus &&
      currentStatus !== StringStreamStatus.Initialized
    ) {
      return {
        ...commonData,
        type: NotificationType.StreamStarted,
      };
    } else if (
      currentStatus === StringStreamStatus.Paused &&
      previousStatus !== currentStatus
    ) {
      return {
        ...commonData,
        type: NotificationType.StreamPaused,
      };
    } else if (
      currentStatus === StringStreamStatus.Active &&
      previousStatus === StringStreamStatus.Paused
    ) {
      return {
        ...commonData,
        type: NotificationType.StreamContinued,
      };
    } else if (
      currentStatus === StringStreamStatus.Active &&
      previousStatus === StringStreamStatus.Active
    ) {
      if (previousStream.wasDue) {
        currentStream.wasDue = true;
      }

      if (previousStream.hasPassedCliff) {
        currentStream.hasPassedCliff = true;
      }

      if (currentStream.receiver_id === accountId) {
        const secondsPassed =
          (Date.now() - Number(currentStream.last_action) / 1e6) / 1000;

        const streamIsDue = new BigNumber(currentStream.tokens_per_sec)
          .multipliedBy(secondsPassed)
          .minus(currentStream.balance)
          .isPositive();

        if (streamIsDue) {
          const wasDue =
            previousStream.wasDue ??
            (await this.findDueNotification(accountId, currentStream.id));

          if (!wasDue) {
            currentStream.wasDue = true;
            return {
              ...commonData,
              type: NotificationType.StreamIsDue,
            };
          }
        }
      }

      if (
        currentStream.cliff &&
        !previousStream.hasPassedCliff &&
        Date.now() > currentStream.cliff / 1000_000
      ) {
        currentStream.hasPassedCliff = true;
        return {
          ...commonData,
          type: NotificationType.StreamCliffPassed,
        };
      }
    } else if (previousStatus && !currentStream) {
      const currentFinishedStream = await this.contractService.getStream(
        previousStream.id,
      );

      if (
        previousStatus !== StringStreamStatus.Initialized ||
        currentFinishedStream.tokens_total_withdrawn !== '0'
      ) {
        return {
          ...commonData,
          streamId: currentFinishedStream.id,
          payload: currentFinishedStream,
          type: NotificationType.StreamFinished,
        };
      }
    }
  }

  private async generateNotifications(
    user: User,
    currentStreams: RoketoStream[],
  ): Promise<Notification[]> {
    const previousStreamsMap = this.array2Map(user.streams, 'id');
    const currentStreamsMap = this.array2Map(currentStreams, 'id');

    const ids = Array.from(
      new Set([
        ...Object.keys(previousStreamsMap),
        ...Object.keys(currentStreamsMap),
      ]),
    );

    const newMaybeNotificationDtos = await Promise.all(
      ids.map((id) => {
        const previousStream = previousStreamsMap[id];
        const currentStream = currentStreamsMap[id];

        return this.getNotification(
          user.accountId,
          previousStream,
          currentStream,
        );
      }),
    );

    return newMaybeNotificationDtos
      .filter(Boolean)
      .map((dto) => plainToInstance(Notification, dto));
  }

  private async processUserStreams(
    user: User,
    currentStreams: RoketoStream[] | null,
  ) {
    const shouldUpdateUser = Boolean(currentStreams) || !user.streams;

    const newNotifications =
      user.streams && currentStreams
        ? await this.generateNotifications(user, currentStreams)
        : [];

    const shouldCreateNotifications = newNotifications.length > 0;

    if (!shouldUpdateUser && !shouldCreateNotifications) {
      return;
    }

    let queryRunner;
    try {
      queryRunner = this.connection.createQueryRunner();
      await queryRunner.startTransaction();

      await Promise.all([
        shouldUpdateUser &&
          queryRunner.manager.update(
            User,
            { accountId: user.accountId },
            { streams: currentStreams ?? [] },
          ),
        shouldCreateNotifications &&
          queryRunner.manager.save(Notification, newNotifications),
      ]);

      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(e);
      this.logger.error(`Error while processing streams of ${user.accountId}`);
      this.logger.error('Previous streams', user.streams);
      this.logger.error('Current streams ', currentStreams);

      await queryRunner?.rollbackTransaction();
    } finally {
      await queryRunner?.release();
    }
  }

  async findAll(accountId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { accountId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  markAllRead(accountId: string) {
    return this.notificationsRepository.update({ accountId }, { isRead: true });
  }
}
