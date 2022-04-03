import { Controller, Get, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AppService } from './app.service';
import { Unauthorized } from './common/dto/unauthorized.dto';

@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: Unauthorized })
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Request() req): string {
    return this.appService.getHello(req.user);
  }
}
