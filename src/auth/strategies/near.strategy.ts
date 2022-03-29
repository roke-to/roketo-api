import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import type { Request } from 'express';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { AuthService } from '../auth.service';
import { LoginDto } from '../login.dto';

@Injectable()
export class NearStrategy extends PassportStrategy(Strategy, 'near') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const loginDto = plainToInstance(LoginDto, req.body);

    const errors = validateSync(loginDto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException(
        errors.flatMap((error) => Object.values(error.constraints)),
      );
    }

    const user = await this.authService.validateUser(loginDto);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
