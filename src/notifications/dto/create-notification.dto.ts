import {
  IsEnum,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { NotificationType } from '../notification.entity';

export class CreateNotificationDto {
  @IsString()
  id: string;

  @IsString()
  accountId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsNumberString()
  createdAt: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}
