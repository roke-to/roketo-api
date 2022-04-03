import {
  buildMessage,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
  IsInt,
} from 'class-validator';
import { differenceInSeconds } from 'date-fns';
import { ApiProperty } from '@nestjs/swagger';

const LOGIN_MESSAGE = process.env.LOGIN_MESSAGE || 'ROKETO-LOGIN';

function StartsWith(
  prefix: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'startsWith',
      constraints: [prefix],
      validator: {
        validate: (value: any, args: ValidationArguments) =>
          typeof value === 'string' && value.startsWith(args.constraints[0]),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must start with "$constraint1"',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

const ACCEPTABLE_TIME_DEVIATION_IN_SECONDS = 60; // 1 minute

function EndsWithCurrentTimestamp(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'endsWithCurrentTimestamp',
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          const timestamp = Number(value.match(/\d+$/)?.[0] ?? 0);

          const diff = differenceInSeconds(timestamp, Date.now());

          return Math.abs(diff) < ACCEPTABLE_TIME_DEVIATION_IN_SECONDS;
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix +
            `$property must end with timestamp deviating from current server time (${Date.now()}) for no more that 1 minute`,
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

  @ApiProperty({
    description: `Login message starting with "${LOGIN_MESSAGE}" and ending with current timestamp`,
    example: `${LOGIN_MESSAGE}-${Date.now()}`,
  })
  @IsString()
  @IsNotEmpty()
  @StartsWith(LOGIN_MESSAGE)
  @EndsWithCurrentTimestamp()
  readonly message: string;

  @ApiProperty({
    description: `Signature of login message signed with user's private key in form of an array of 64 integer numbers`,
    example: Array.from({ length: 64 }).map((unused, index) => index),
  })
  @ArraySize(64)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(255, { each: true })
  readonly signature: number[];
}
