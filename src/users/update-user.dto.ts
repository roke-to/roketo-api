import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'The name of a user.' })
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiProperty({ description: 'The email of a user.' })
  @ValidateIf((object, value) => Boolean(value))
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiProperty({ description: "User's permission for email notifications." })
  @IsBoolean()
  @IsOptional()
  readonly allowNotifications?: boolean;
}
