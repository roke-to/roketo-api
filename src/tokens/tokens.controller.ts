import { Controller, Param, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/guards/jwt-auth.guard';

import { TokensService } from './tokens.service';

@ApiTags('tokens')
@ApiBearerAuth()
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Public()
  @Get('fts/:accountId')
  findAllTokens(@Param('accountId') accountId: string) {
    return this.tokensService.getTokens(accountId);
  }
  
  @Public()
  @Get('nfts/:accountId')
  findAllTFTs(@Param('accountId') accountId: string) {
    return this.tokensService.getNFTs(accountId);
  }
}
