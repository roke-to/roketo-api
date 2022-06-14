import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { ContractModule } from '../contract/contract.module';
import { UsersModule } from '../users/users.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';
import { JWT_SECRET } from '../common/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    JwtModule.register({
      secret: JWT_SECRET,
    }),
    UsersModule,
    ContractModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
