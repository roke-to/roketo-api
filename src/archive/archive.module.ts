import { Archive } from './archive.entity';
import { ArchiveService } from 'src/archive/archive.service';
import { ArchiveController } from './archive.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { JWT_SECRET } from '../common/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Archive]),
    JwtModule.register({
      secret: JWT_SECRET,
    }),
  ],
  controllers: [ArchiveController],
  exports: [ArchiveService],
  providers: [ArchiveService],
})
export class ArchiveModule {}
