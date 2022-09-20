import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NearModule } from './near/near.module';
import { ContractModule } from './contract/contract.module';
import { TokensModule } from './tokens/tokens.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot(),
    NotificationsModule,
    ScheduleModule.forRoot(),
    NearModule,
    ContractModule,
    TokensModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
