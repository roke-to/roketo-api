import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Exclude, instanceToPlain } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';

import type { RoketoStream } from '../common/contract.types';

@Entity()
export class User {
  @PrimaryColumn()
  accountId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Exclude()
  @ApiHideProperty()
  @Column({ type: 'json', nullable: true })
  streams: RoketoStream[];

  toJSON() {
    return instanceToPlain(this);
  }
}
