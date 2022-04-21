import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';

import { UsersService } from '../users/users.service';
import { ContractService } from '../contract/contract.service';
import { User } from '../users/user.entity';
import type { RoketoStream } from '../common/contract.types';
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

  isBusy = false;

  @Cron(EACH_MINUTE)
  async processCurrentStreams() {
    if (this.isBusy) {
      console.log('Busy processing streams, skipped.');
      return;
    }

    this.isBusy = true;

    const users = await this.usersService.findAll();

    const allStreams = await Promise.all(
      users.map((user) => this.contractService.getStreams(user.accountId)),
    );

    await Promise.all(
      users.map(async (user, index) => {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.startTransaction();

        try {
          await queryRunner.manager.update(
            User,
            { accountId: user.accountId },
            { streams: allStreams[index] },
          );

          if (user.streams) {
            const previousStreamsMap: Record<string, RoketoStream> =
              user.streams.reduce((streamsMap, stream) => {
                streamsMap[stream.id] = stream;

                return streamsMap;
              }, {});

            const currentStreamsMap = allStreams[index].reduce(
              (streamsMap, stream) => {
                streamsMap[stream.id] = stream;

                return streamsMap;
              },
              {},
            );

            const ids = Array.from(
              new Set([
                ...Object.keys(previousStreamsMap),
                ...Object.keys(currentStreamsMap),
              ]),
            );

            const newNotificationDtos = ids
              .map((id) => {
                const oldStream = previousStreamsMap[id];
                const newStream = currentStreamsMap[id];

                const type: NotificationType | undefined = (() => {
                  const oldStatus = oldStream?.status;
                  const newStatus = newStream?.status;

                  if (oldStatus !== 'Active' && newStatus === 'Active') {
                    return NotificationType.StreamStarted;
                  } else if (oldStatus && !newStatus) {
                    return NotificationType.StreamStopped;
                  } else if (oldStatus !== 'Paused' && newStatus === 'Paused') {
                    return NotificationType.StreamPaused;
                  } else if (
                    typeof oldStatus !== 'object' &&
                    typeof newStatus === 'object'
                  ) {
                    return NotificationType.StreamFinished;
                  }
                })();

                if (type) {
                  return {
                    accountId: user.accountId,
                    type,
                    createdAt: Date.now(),
                    payload: newStream || oldStream,
                  };
                }
              })
              .filter(Boolean);

            const newNotifications = queryRunner.manager.create(
              Notification,
              newNotificationDtos,
            );

            await queryRunner.manager.save(Notification, newNotifications);
          }

          await queryRunner.commitTransaction();
        } catch (e) {
          console.error(e);
          console.error(`Error while processing streams of `, user.accountId);
          console.error('Previous streams', user.streams);
          console.error('Current streams ', allStreams[index]);
          await queryRunner.rollbackTransaction();
        } finally {
          await queryRunner.release();
        }
      }),
    );

    this.isBusy = false;
  }
}
