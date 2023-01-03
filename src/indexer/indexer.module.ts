import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFt } from 'src/tokens/entitites/userFT.entity';
import { UserNft } from 'src/tokens/entitites/userNFT.entity';
import { UsersModule } from 'src/users/users.module';
import { IndexerService } from './indexer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserFt,
      UserNft,
    ]),
    UsersModule
  ],
  providers: [IndexerService],
})
export class IndexerModule {}
