import { Injectable } from '@nestjs/common';
import { utils } from 'near-api-js';
import { JwtService } from '@nestjs/jwt';

import type { LoginDto } from './login.dto';
import { UsersService } from '../users/users.service';
import { AccessTokenDto } from './access-token.dto';
import { NearService } from '../near/near.service';

// TODO: Drop this and everything related to this after testing
const isDangerousDevelopment = process.env.NODE_ENV !== 'production';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly nearService: NearService,
  ) {}

  async validateUser({
    accountId,
    timestamp,
    signature,
  }: LoginDto): Promise<any> {
    const roketoPublicKeys = await this.nearService.findUserPublicKeys(
      accountId,
    );

    const Uint8Message = Buffer.from(String(timestamp));

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

  async login(user): Promise<AccessTokenDto> {
    const payload = { sub: user.accountId };

    await this.usersService.createIfNew(user.accountId);

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
