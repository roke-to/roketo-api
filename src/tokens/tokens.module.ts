import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { UserFt } from './entitites/userFT.entity';
import { UserNft } from './entitites/userNFT.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    UserFt,
    UserNft
  ])],
  providers: [TokensService],
  controllers: [TokensController],
})
export class TokensModule {}
