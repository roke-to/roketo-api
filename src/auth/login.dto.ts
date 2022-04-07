import {
  buildMessage,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateBy,
  ValidationOptions,
  IsInt,
} from 'class-validator';
import { differenceInSeconds } from 'date-fns';
import { ApiProperty } from '@nestjs/swagger';

const ACCEPTABLE_TIME_DEVIATION_IN_SECONDS = 60; // 1 minute

function IsCurrentTimestamp(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isCurrentTimestamp',
      validator: {
        validate(value: any) {
          const timestamp = Number(value);

          const diff = differenceInSeconds(timestamp, Date.now());

          return Math.abs(diff) < ACCEPTABLE_TIME_DEVIATION_IN_SECONDS;
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix +
            `$property must not deviate from current server time (${Date.now()}) for more that 1 minute`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

function ArraySize(
  size: number,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'arraySize',
      constraints: [size],
      validator: {
        validate: (value, args) =>
          Array.isArray(value) && value.length === args.constraints[0],
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must contain exactly $constraint1 elements',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

export class LoginDto {
  @ApiProperty({ description: 'The accountId of a user.' })
  @IsString()
  @IsNotEmpty()
  readonly accountId: string;

  @ApiProperty({ description: `Current timestamp.` })
  @IsCurrentTimestamp()
  readonly timestamp: number;

  @ApiProperty({
    description: `Signature of timestamp string signed with user's private key in form of an array of 64 integer numbers.`,
    example: Array.from({ length: 64 }).map((unused, index) => index),
  })
  @ArraySize(64)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(255, { each: true })
  readonly signature: number[];
}
