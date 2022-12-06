import { Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

import { RoketoStream } from '../common/stream.dto';

@Entity()
export class ArchivedStream {
  @PrimaryColumn()
  streamId: string;

  @Index()
  @Column()
  accountId: string;

  @Index()
  @Column()
  receiverId: string;

  @Column({ type: 'timestamp with time zone' })
  startedAt: Date;

  @Column({ type: 'timestamp with time zone' })
  finishedAt: Date;

  @Column({ type: 'json', default: {} })
  payload: {
    stream: RoketoStream
  };
}
