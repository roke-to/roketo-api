import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Exclude, instanceToPlain } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';

import type { RoketoStream } from '../common/stream.dto';

@Entity()
export class User {
  @PrimaryColumn()
  accountId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  verificationEmailSentAt: Date;

  @Column({ default: true })
  allowNotifications: boolean;

  @Exclude()
  @ApiHideProperty()
  @Column({ type: 'json', nullable: true })
  streams: RoketoStream[];

  toJSON() {
    return instanceToPlain(this);
  }
}
