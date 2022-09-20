import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { TokensService } from './tokens.service';

@ApiTags('tokens')
@ApiBearerAuth()
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  findAllTokens(@Req() req) {
    return this.tokensService.getTokens(req.user.accountId);
  }
}
