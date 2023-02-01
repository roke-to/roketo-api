import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { IndexerModule } from './indexer/indexer.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot(),
    ScheduleModule.forRoot(),
    IndexerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class WorkerModule {}
