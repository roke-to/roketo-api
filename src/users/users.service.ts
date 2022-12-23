import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import * as SendGrid from '@sendgrid/mail';
import { Cron } from '@nestjs/schedule';

import { User } from './user.entity';
import { UpdateUserDto } from './update-user.dto';
import { API_HOST, DAPP_HOST } from '../common/config';

const VERIFY_EMAIL_COMMAND = 'verifyEmail';

const EACH_5_SECONDS = '*/5 * * * * *';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  }

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

  async update(accountId: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne(accountId);

    const EMAIL_CHANGED_DTO: Partial<User> = {
      isEmailVerified: false,
      verificationEmailSentAt: null,
    };

    const hasEmailChanged =
      'email' in updateUserDto && user.email !== updateUserDto.email;

    return this.usersRepository.update(accountId, {
      ...updateUserDto,
      ...(hasEmailChanged && EMAIL_CHANGED_DTO),
    });
  }

  findAll() {
    return this.usersRepository.find();
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

  async sendVerificationEmail({ accountId, name, email }: User) {
    const verificationPayload = this.jwtService.sign({
      accountId,
      email,
      command: VERIFY_EMAIL_COMMAND,
    });

    await SendGrid.send({
      from: { name: 'Roketo email verifier', email: 'noreply@roke.to' },
      to: { name: name || accountId, email },
      templateId: 'd-f0a6fb55e9ce4387a791a859284aa3c1',
      dynamicTemplateData: {
        network: process.env.NEAR_NETWORK_ID,
        logoLink: DAPP_HOST,
        accountId,
        verificationLink: `${API_HOST}/users/${accountId}/verifyEmail/${verificationPayload}`,
      },
    });

    await this.usersRepository.update(accountId, {
      verificationEmailSentAt: new Date(),
    });
  }

  async resendVerificationEmail(accountId: string) {
    const user = await this.usersRepository.findOne(accountId);

    if (user.email && !user.isEmailVerified) {
      return this.sendVerificationEmail(user);
    }
  }

  private readonly logger = new Logger('Cron');

  isBusy = false;

  @Cron(EACH_5_SECONDS)
  async sendInitialVerificationEmailsIfNotBusy() {
    if (this.isBusy) {
      this.logger.log('Busy sending verification emails, skipped.');
      return;
    }

    const start = Date.now();
    try {
      this.isBusy = true;

      this.logger.log('Starting sending verification emails...');

      await this.sendInitialVerificationEmails();

      this.logger.log(
        `Finished sending verification emails in ${Date.now() - start}ms.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed sending verification emails after ${Date.now() - start}ms.`,
        error.message,
        error.stack,
      );
    } finally {
      this.isBusy = false;
    }
  }

  async sendInitialVerificationEmails() {
    const users = await this.usersRepository.find({
      where: {
        email: Like('%@%'),
        isEmailVerified: false,
        verificationEmailSentAt: null,
      },
    });

    await Promise.all(users.map((user) => this.sendVerificationEmail(user)));
  }
}
