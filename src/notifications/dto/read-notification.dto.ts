import { Equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReadNotificationDto {
  @ApiProperty({ default: true })
  @Equals(true)
  readonly isRead: boolean;
}
