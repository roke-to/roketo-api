import { Injectable } from '@nestjs/common';
import { connect, utils } from 'near-api-js';
import { JwtService } from '@nestjs/jwt';

import type { LoginDto } from './login.dto';

const DAO_ID = 'dev-1635510732093-17387698050424';

const TESTNET_CONFIG = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
  headers: {},
  keyStore: 'no' as any,
};

// TODO: Drop this and everything related to this after testing
const isDangerousDevelopment = process.env.NODE_ENV !== 'production';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser({
    accountId,
    message,
    signature,
  }: LoginDto): Promise<any> {
    const near = await connect(TESTNET_CONFIG);
    const account = await near.account(accountId);
    const keys = await account.getAccessKeys();

    const roketoPublicKeys = keys
      .filter((key) => {
        const { permission } = key.access_key;

        return (
          typeof permission !== 'string' &&
          permission.FunctionCall.receiver_id === DAO_ID
        );
      })
      .map((key) => key.public_key);

    const Uint8Message = Buffer.from(message);

    if (isDangerousDevelopment) {
      const testKeyPair = utils.KeyPairEd25519.fromString(
        '5nne6CNTCTmevKppSYcFvxRAogrbYmPEp1dfnX5qnjqdNxUeoTU39fj4hLwdUnXHRmvcuRqDqF1utDVkij3eAEZj',
      );
      signature = [...testKeyPair.sign(Uint8Message).signature];
      roketoPublicKeys.push(testKeyPair.getPublicKey().toString());
    }

    const Uint8Signature = Uint8Array.from(signature);

    const verified = roketoPublicKeys.some((key) => {
      const publicKey = utils.PublicKey.from(key);
      return publicKey.verify(Uint8Message, Uint8Signature);
    });

    if (verified) {
      return { accountId };
    }

    return null;
  }

  async login(user) {
    const payload = { sub: user.accountId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
