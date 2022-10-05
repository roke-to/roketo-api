import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { UserFTs } from './userFTs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserFTs])],
  providers: [TokensService],
  controllers: [TokensController],
})
export class TokensModule {}
