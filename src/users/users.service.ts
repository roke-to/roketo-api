import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';

import { User } from './user.entity';
import { UpdateUserDto } from './update-user.dto';

const VERIFY_EMAIL_COMMAND = 'verifyEmail';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
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
    return this.usersRepository.update(accountId, updateUserDto);
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

  async verifyEmail(accountId: string, jwt: string) {
    const payload = this.jwtService.decode(jwt);

    if (
      !payload ||
      typeof payload !== 'object' ||
      payload.command !== VERIFY_EMAIL_COMMAND ||
      payload.accountId !== accountId
    ) {
      throw new BadRequestException();
    }

    const user = await this.usersRepository.findOne(accountId);

    if (!user) {
      throw new BadRequestException();
    }

    if (user.email !== payload.email) {
      throw new BadRequestException(
        'The email from the link mismatched with the current email of the user',
      );
    }

    if (payload.exp * 1000 < Date.now()) {
      throw new BadRequestException(
        'Verification link expired, please try resending verification email',
      );
    }

    return this.usersRepository.update(accountId, {
      isEmailVerified: true,
    });
  }
}
