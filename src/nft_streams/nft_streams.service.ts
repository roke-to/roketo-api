import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NftStream } from './entities/nft_stream.entity';

@Injectable()
export class NftStreamsService {
  constructor(
    @InjectRepository(NftStream)
    private readonly nftStreamsRepository: Repository<NftStream>,
  ) {}

  async findAll(accountId: string) {
    return await this.nftStreamsRepository.find({
      where: [{ accountId }, { receiverId: accountId }],
      order: { startedAt: 'DESC' },
      take: 100,
    });
  }
}
