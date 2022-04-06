import { Injectable } from '@nestjs/common';
import { connect } from 'near-api-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';

import { User } from './user.entity';
import { UpsertUserDto } from './upsert-user.dto';

const ROKETO_DAO_ID = 'streaming-roketo.dcversus.testnet';

const TESTNET_CONFIG = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
  headers: {},
  keyStore: 'no' as any,
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findUserPublicKeys(accountId: string): Promise<string[]> {
    const near = await connect(TESTNET_CONFIG);
    const account = await near.account(accountId);
    const allAccessKeys = await account.getAccessKeys();

    return allAccessKeys
      .filter(function getRoketoKeys(key) {
        const { permission } = key.access_key;

        return (
          typeof permission !== 'string' &&
          permission.FunctionCall.receiver_id === ROKETO_DAO_ID
        );
      })
      .map((key) => key.public_key);
  }

  async findOne(accountId: string): Promise<User> {
    const user = await this.usersRepository.findOne(accountId);

    return user || this.usersRepository.create({ accountId });
  }

  async upsert(accountId: string, updateUserDto: UpsertUserDto): Promise<User> {
    const upsertedUser = { accountId, ...updateUserDto };

    const user =
      (await this.usersRepository.preload(upsertedUser)) ||
      this.usersRepository.create(upsertedUser);

    return this.usersRepository.save(user);
  }

  async getAvatarUrl(accountId: string) {
    const { email } = await this.findOne(accountId);

    const identifier =
      email || createHash('sha256').update(accountId).digest('hex');

    const identifierHash = createHash('md5')
      .update(identifier.toLowerCase().trim())
      .digest('hex');

    return `https://gravatar.com/avatar/${identifierHash}?default=identicon&size=64`;
  }
}
