import { Controller, Param, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/guards/jwt-auth.guard';

import { NftStreamsService } from './nft_streams.service';

@ApiTags('nft_streams')
@Controller('nft_streams')
export class NftStreamsController {
  constructor(private readonly nftStreamsService: NftStreamsService) {}

  @Public()
  @Get(':accountId')
  findAllNftTransactions(@Param('accountId') accountId: string) {
    return this.nftStreamsService.findAll(accountId);
  }
}
