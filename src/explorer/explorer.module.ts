import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { ExplorerService } from './explorer.service';

@Module({
  imports: [NotificationsModule],
  providers: [ExplorerService],
})
export class ExplorerModule {}
