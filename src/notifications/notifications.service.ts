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

  create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    );

    return this.notificationsRepository.save(notification);
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
