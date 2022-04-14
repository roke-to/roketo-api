import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

import { NotificationType } from '../notification.entity';

export class CreateNotificationDto {
  @IsString()
  accountId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}
