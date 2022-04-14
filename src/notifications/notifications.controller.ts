import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { NotificationsService } from './notifications.service';
import { ReadNotificationDto } from './dto/read-notification.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req) {
    return this.notificationsService.findAll(req.user.accountId);
  }

  @Patch(':id')
  markRead(
    @Req() req,
    @Param('id') id: string,
    @Body() readNotificationDto: ReadNotificationDto,
  ) {
    return this.notificationsService.markRead(
      id,
      req.user.accountId,
      readNotificationDto,
    );
  }
}
