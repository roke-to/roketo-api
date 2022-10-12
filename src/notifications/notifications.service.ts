import { ArchivedStream } from '../archived_streams/archived_stream.entity';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';
import BigNumber from 'bignumber.js';
import { JwtService } from '@nestjs/jwt';
import * as SendGrid from '@sendgrid/mail';

import { UsersService } from '../users/users.service';
import { ContractService } from '../contract/contract.service';
import { User } from '../users/user.entity';
import { RoketoStream, StringStreamStatus } from '../common/stream.dto';
import { Notification, NotificationType } from './notification.entity';
import { API_HOST, DAPP_HOST } from '../common/config';

const UNSUBSCRIBE_COMMAND = 'unsubscribe';

const EACH_5_SECONDS = '*/5 * * * * *';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    private readonly connection: Connection,
    private readonly usersService: UsersService,
    private readonly contractService: ContractService,
    private readonly jwtService: JwtService,
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
      payload: { stream: currentStream },
    };

    // Refer to https://www.notion.so/kikimora-labs/ROKETO-56-Notification-s-text-ee6b873ab8a045b1af141fb707678d51
    const previousStatus = previousStream?.status;
    const currentStatus = currentStream?.status;

    if (
      currentStatus === previousStatus &&
      new BigNumber(currentStream.balance).isGreaterThan(previousStream.balance)
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
          payload: { stream: currentFinishedStream },
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

    const archivedStreams = newNotifications
      .filter(({ type }) => type === NotificationType.StreamFinished)
      .map((notification) => plainToInstance(
        ArchivedStream,
        {
          streamId: notification.streamId,
          accountId: notification.accountId,
          receiverId: notification.payload.stream.receiver_id,
          startedAt: new Date(notification.payload.stream.timestamp_created / 1000000),
          finishedAt: new Date(notification.payload.stream.last_action / 1000000),
          payload: notification.payload
        }
      ));

    const shouldCreateNotifications = newNotifications.length > 0;
    const shouldCreateArchive = archivedStreams.length > 0;

    if (!shouldUpdateUser && !shouldCreateNotifications) {
      return;
    }

    try {
      if (user.isEmailVerified && user.allowNotifications) {
        await Promise.all(
          newNotifications.map((notification) =>
            this.sendNotificationEmail(user, notification),
          ),
        );
      }
    } catch (error) {
      console.error(`Error sending notification emails`, error);
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
        shouldCreateArchive &&
            queryRunner.manager.save(ArchivedStream, archivedStreams),
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

  async unsubscribe(accountId: string, jwt: string) {
    const payload = this.jwtService.decode(jwt);

    if (
      !payload ||
      typeof payload !== 'object' ||
      payload.command !== UNSUBSCRIBE_COMMAND ||
      payload.accountId !== accountId
    ) {
      throw new BadRequestException();
    }

    const user = await this.usersService.findOne(accountId);

    if (!user) {
      throw new BadRequestException();
    }

    return this.usersService.update(accountId, {
      allowNotifications: false,
    });
  }

  getNotificationSubjectAndText(
    accountId: string,
    notification: Notification,
  ): { subject: string; notificationText: string } {
    const {
      owner_id: senderId,
      receiver_id: receiverId,
      id: streamId,
    } = notification.payload.stream;
    const isIncoming = accountId === receiverId;

    switch (notification.type) {
      case NotificationType.StreamStarted:
        return {
          subject: isIncoming
            ? 'New incoming stream created'
            : 'New outgoing stream created',
          notificationText: isIncoming
            ? `${senderId} created a stream with ID ${streamId} to you. Please be ready to receive the stream.`
            : `You’ve successfully created a stream to ${receiverId} with ID ${streamId}.`,
        };
      case NotificationType.StreamPaused:
        return {
          subject: isIncoming
            ? 'Incoming stream was paused'
            : 'Outgoing stream was paused',
          notificationText: isIncoming
            ? `The incoming stream from ${senderId} with ID ${streamId} was paused.`
            : `The outgoing stream to ${receiverId} with ID ${streamId} was paused.`,
        };
      case NotificationType.StreamFinished:
        return {
          subject: isIncoming
            ? 'Incoming stream was completed'
            : 'Outgoing stream was completed',
          notificationText: isIncoming
            ? `The incoming stream from ${senderId} with ID ${streamId} was completed.`
            : `The outgoing stream to ${receiverId} with ID ${streamId} was completed.`,
        };
      case NotificationType.StreamContinued:
        return {
          subject: isIncoming
            ? 'Incoming stream was continued'
            : 'Outgoing stream was continued',
          notificationText: isIncoming
            ? `The incoming stream from ${senderId} with ID ${streamId} was continued.`
            : `The outgoing stream to ${receiverId} with ID ${streamId} was continued.`,
        };
      case NotificationType.StreamFundsAdded:
        return {
          subject: isIncoming
            ? 'Funds were added to incoming stream'
            : 'Funds were added to outgoing stream',
          notificationText: isIncoming
            ? `Funds were added to the incoming stream from ${senderId} with ID ${streamId}. The stream will last appropriate time according to the amount of added funds.`
            : `Funds were added to the outgoing stream to ${receiverId} with ID ${streamId}. The stream will last appropriate time according to the amount of added funds.`,
        };
      case NotificationType.StreamCliffPassed:
        return {
          subject: isIncoming
            ? 'Incoming stream has passed cliff period'
            : 'Outgoing stream has passed cliff period',
          notificationText: isIncoming
            ? `The incoming stream from ${senderId} with ID ${streamId} has passed cliff period.`
            : `The outgoing stream to ${receiverId} with ID ${streamId} has passed cliff period.`,
        };
      case NotificationType.StreamIsDue:
        return {
          subject: isIncoming
            ? 'Incoming stream is ready to be fully withdrawn'
            : 'Outgoing stream is ready to be fully withdrawn',
          notificationText: isIncoming
            ? `The incoming stream from ${senderId} with ID ${streamId} is ready to be fully withdrawn.`
            : `The outgoing stream to ${receiverId} with ID ${streamId} is ready to be fully withdrawn.`,
        };
    }
  }

  async sendNotificationEmail(
    { name, accountId, email }: User,
    notification: Notification,
  ) {
    const { subject, notificationText } = this.getNotificationSubjectAndText(
      accountId,
      notification,
    );

    const unsubscribePayload = this.jwtService.sign({
      accountId,
      email,
      command: UNSUBSCRIBE_COMMAND,
    });

    const networkText = process.env.NEAR_NETWORK_ID !== 'mainnet' ? ' [' + process.env.NEAR_NETWORK_ID + ']' : '';

    await SendGrid.send({
      from: { name: 'Roketo notifier', email: 'noreply@roke.to' },
      to: { name: name || accountId, email },
      templateId: 'd-22fa8e12064c42c2a1da7d204b5857e5',
      dynamicTemplateData: {
        subject: `${subject}${networkText} @ Roketo`,
        logoLink: DAPP_HOST,
        accountId,
        notificationText,
        streamLink: `${DAPP_HOST}/#/streams/${notification.payload.stream.id}`,
        unsubscribeLink: `${API_HOST}/notifications/${accountId}/unsubscribe/${unsubscribePayload}`,
      },
    });
  }
}
