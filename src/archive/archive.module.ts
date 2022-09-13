import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Archive } from './archive.entity';
import { ArchiveService } from 'src/archive/archive.service';
import { ArchiveController } from './archive.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Archive]),
  ],
  controllers: [ArchiveController],
  exports: [ArchiveService],
  providers: [ArchiveService],
})
export class ArchiveModule {}
