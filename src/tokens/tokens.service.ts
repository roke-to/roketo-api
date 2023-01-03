import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFt } from './entitites/userFT.entity';
import { UserNft } from './entitites/userNFT.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(UserFt)
    private readonly userFTRepository: Repository<UserFt>,
    @InjectRepository(UserNft)
    private readonly userNFTRepository: Repository<UserNft>,
  ) { }

  async getTokens(accountId: string) {
    return await this.userFTRepository.find({
      where: { accountId }
    });
  }
  
  async getNFTs(accountId: string) {
    return await this.userNFTRepository.find({
      where: { accountId }
    });
  }
}
