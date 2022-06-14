import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { NotificationsService } from './notifications.service';
import { Public } from '../auth/guards/jwt-auth.guard';
import { DAPP_HOST } from '../common/config';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req) {
    return this.notificationsService.findAll(req.user.accountId);
  }

  @Post('readAll')
  @HttpCode(HttpStatus.NO_CONTENT)
  markAllRead(@Req() req) {
    return this.notificationsService.markAllRead(req.user.accountId);
  }

  @Public()
  @Get(':accountId/unsubscribe/:jwt')
  async unsubscribe(
    @Param('accountId') accountId: string,
    @Param('jwt') jwt: string,
    @Res() res: Response,
  ) {
    await this.notificationsService.unsubscribe(accountId, jwt);

    res.redirect(HttpStatus.FOUND, DAPP_HOST);
  }
}
