import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { RoketoStream } from '../common/stream.dto';

@Entity()
export class ArchivedStream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
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
