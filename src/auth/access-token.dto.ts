import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @ApiProperty({ description: 'JWT to use in bearer authorization' })
  accessToken: string;
}
