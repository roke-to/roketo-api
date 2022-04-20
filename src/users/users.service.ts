import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';

import { User } from './user.entity';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOne(accountId: string): Promise<User> {
    const user = await this.usersRepository.findOne(accountId);

    return user || this.usersRepository.create({ accountId });
  }

  async createIfNew(accountId) {
    const exists =
      (await this.usersRepository.count({ where: { accountId } })) > 0;

    if (!exists) {
      const user = this.usersRepository.create({ accountId });
      await this.usersRepository.save(user);
    }
  }

  update(accountId: string, updateUserDto: UpdateUserDto) {
    this.usersRepository.update(accountId, updateUserDto);
  }

  findAll() {
    return this.usersRepository.find({ select: ['accountId', 'streams'] });
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
