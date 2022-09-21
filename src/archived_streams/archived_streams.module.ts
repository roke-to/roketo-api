import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArchivedStreams } from './archived_streams.entity';
import { ArchivedStreamsService } from 'src/archived_streams/archived_streams.service';
import { ArchivedStreamsController } from './archived_streams.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArchivedStreams]),
  ],
  controllers: [ArchivedStreamsController],
  exports: [ArchivedStreamsService],
  providers: [ArchivedStreamsService],
})
export class ArchivedStreamsModule {}
