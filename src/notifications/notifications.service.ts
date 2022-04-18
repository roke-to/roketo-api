import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './notification.entity';
import { ReadNotificationDto } from './dto/read-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async findAll(accountId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({ where: { accountId } });
  }

  async getLatestTimestamp(): Promise<string> {
    const [latestNotification] = await this.notificationsRepository.find({
      order: { createdAt: 'DESC' },
      select: ['createdAt'],
      take: 1,
    });

    const THE_BEGINNING = '0';

    return latestNotification?.createdAt ?? THE_BEGINNING;
  }

  createMany(createNotificationDtos: CreateNotificationDto[]) {
    return this.notificationsRepository.upsert(createNotificationDtos, ['id']);
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
