import { ApiProperty } from '@nestjs/swagger';

export class BadRequest {
  @ApiProperty({ default: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Array of error messages' })
  message: string[];

  @ApiProperty({ default: 'Bad request' })
  error: string;
}
