import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';

import { UsersService } from '../users/users.service';
import { ContractService } from '../contract/contract.service';
import { User } from '../users/user.entity';
import { RoketoStream, StringStreamStatus } from '../common/contract.types';
import { Notification, NotificationType } from './notification.entity';
import { ReadNotificationDto } from './dto/read-notification.dto';

const EACH_MINUTE = '0 */1 * * * *';

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

  @Cron(EACH_MINUTE)
  private async generateIfNotBusy() {
    if (this.isBusy) {
      this.logger.log('Busy processing streams, skipped.');
      return;
    }

    this.isBusy = true;

    this.logger.log('Starting processing streams...');
    const start = Date.now();

    await this.processAllUsersStreams();

    this.logger.log(`Finished processing streams in ${Date.now() - start}ms.`);

    this.isBusy = false;
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

  private getNotificationType(
    previousStream?: RoketoStream,
    currentStream?: RoketoStream,
  ): NotificationType | undefined {
    const previousStatus = previousStream?.status;
    const currentStatus = currentStream?.status;

    if (
      currentStatus === StringStreamStatus.Active &&
      currentStatus !== previousStatus
    ) {
      return NotificationType.StreamStarted;
    } else if (previousStatus && !currentStatus) {
      return NotificationType.StreamStopped;
    } else if (
      currentStatus === StringStreamStatus.Paused &&
      currentStatus !== previousStatus
    ) {
      return NotificationType.StreamPaused;
    } else if (
      typeof previousStatus !== 'object' &&
      typeof currentStatus === 'object'
    ) {
      return NotificationType.StreamFinished;
    }
  }

  private generateNotifications(
    user: User,
    currentStreams: RoketoStream[],
  ): Notification[] {
    const previousStreamsMap = this.array2Map(user.streams, 'id');
    const currentStreamsMap = this.array2Map(currentStreams, 'id');

    const ids = Array.from(
      new Set([
        ...Object.keys(previousStreamsMap),
        ...Object.keys(currentStreamsMap),
      ]),
    );

    const newNotificationDtos = ids
      .map((id) => {
        const previousStream = previousStreamsMap[id];
        const currentStream = currentStreamsMap[id];

        const type: NotificationType | undefined = this.getNotificationType(
          previousStream,
          currentStream,
        );

        if (type) {
          return {
            accountId: user.accountId,
            type,
            createdAt: Date.now(),
            payload: currentStream || previousStream,
          };
        }
      })
      .filter(Boolean);

    const newNotifications = newNotificationDtos.map((dto) =>
      plainToInstance(Notification, dto),
    );

    return newNotifications;
  }

  private async processUserStreams(user: User, currentStreams: RoketoStream[]) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        User,
        { accountId: user.accountId },
        { streams: currentStreams },
      );

      if (user.streams) {
        const newNotifications = this.generateNotifications(
          user,
          currentStreams,
        );

        await queryRunner.manager.save(Notification, newNotifications);
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      this.logger.error(e);
      this.logger.error(`Error while processing streams of `, user.accountId);
      this.logger.error('Previous streams', user.streams);
      this.logger.error('Current streams ', currentStreams);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(accountId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({ where: { accountId } });
  }

  async markRead(
    id: string,
    accountId: string,
    readNotificationDto: ReadNotificationDto,
  ) {
    const notification = await this.notificationsRepository.preload({
      id,
      ...readNotificationDto,
    });

    if (!notification || notification.accountId !== accountId) {
      throw new NotFoundException();
    }

    return this.notificationsRepository.save(notification);
  }
}
