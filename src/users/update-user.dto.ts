import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, ValidateIf } from 'class-validator';
import { Exclude } from 'class-transformer';

import { RoketoStream } from '../near/near.service';

export class UpdateUserDto {
  @ApiProperty({ description: 'The name of a user.' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'The email of a user.' })
  @ValidateIf((object, value) => Boolean(value))
  @IsEmail()
  readonly email: string;

  @ApiHideProperty()
  @Exclude()
  streams: RoketoStream[];
}
