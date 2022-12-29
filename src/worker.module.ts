import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NftStreamsModule } from './nft_streams/nft_streams.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot(),
    ScheduleModule.forRoot(),
    NftStreamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class WorkerModule {}
