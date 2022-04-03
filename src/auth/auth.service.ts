import { Injectable } from '@nestjs/common';
import { utils } from 'near-api-js';
import { JwtService } from '@nestjs/jwt';

import type { LoginDto } from './login.dto';
import { UsersService } from '../users/users.service';
import { AccessTokenDto } from './access-token.dto';

// TODO: Drop this and everything related to this after testing
const isDangerousDevelopment = process.env.NODE_ENV !== 'production';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser({
    accountId,
    message,
    signature,
  }: LoginDto): Promise<any> {
    const roketoPublicKeys = await this.usersService.findUserPublicKeys(
      accountId,
    );

    const Uint8Message = Buffer.from(message);

    if (isDangerousDevelopment) {
      const testKeyPair = utils.KeyPairEd25519.fromString(
        '5nne6CNTCTmevKppSYcFvxRAogrbYmPEp1dfnX5qnjqdNxUeoTU39fj4hLwdUnXHRmvcuRqDqF1utDVkij3eAEZj',
      );
      signature = [...testKeyPair.sign(Uint8Message).signature];
      roketoPublicKeys.push(testKeyPair.getPublicKey().toString());
    }

    const Uint8Signature = Uint8Array.from(signature);

    const verified = roketoPublicKeys.some((key) =>
      utils.PublicKey.from(key).verify(Uint8Message, Uint8Signature),
    );

    return verified ? { accountId } : null;
  }

  login(user): AccessTokenDto {
    const payload = { sub: user.accountId };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
