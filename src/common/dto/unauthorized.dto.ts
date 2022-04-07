import { ApiProperty } from '@nestjs/swagger';

export class Unauthorized {
  @ApiProperty({ default: 401 })
  statusCode: number;

  @ApiProperty({ default: 'Unauthorized' })
  error: string;
}
