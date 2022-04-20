import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, ValidateIf } from 'class-validator';

export class UpsertUserDto {
  @ApiProperty({ description: 'The name of a user.' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'The email of a user.' })
  @ValidateIf((object, value) => Boolean(value))
  @IsEmail()
  readonly email: string;
}