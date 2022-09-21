import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArchivedStream } from './archived_stream.entity';
import { ArchivedStreamsService } from 'src/archived_streams/archived_streams.service';
import { ArchivedStreamsController } from './archived_streams.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArchivedStream]),
  ],
  controllers: [ArchivedStreamsController],
  exports: [ArchivedStreamsService],
  providers: [ArchivedStreamsService],
})
export class ArchivedStreamsModule {}
