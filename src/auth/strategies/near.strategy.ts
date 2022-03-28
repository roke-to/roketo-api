import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import type { Request } from 'express';

import { AuthService } from '../auth.service';

@Injectable()
export class NearStrategy extends PassportStrategy(Strategy, 'near') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const { accountId, message, signature } = req.body;

    if (!accountId || !message || !signature) {
      // TODO: Add validation pipeline about expected fields.
      throw new BadRequestException();
    }

    const user = await this.authService.validateUser(
      accountId,
      message,
      signature,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
