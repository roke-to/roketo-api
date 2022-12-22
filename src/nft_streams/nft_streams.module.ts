import { Module } from '@nestjs/common';
import { NftStreamsService } from './nft_streams.service';
import { NftStreamsController } from './nft_streams.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftStream } from './entities/nft_stream.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NftStream]),
    UsersModule
  ],
  controllers: [NftStreamsController],
  providers: [NftStreamsService]
})
export class NftStreamsModule {}
