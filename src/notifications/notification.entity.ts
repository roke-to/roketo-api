import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { RoketoStream } from '../common/stream.dto';

export enum NotificationType {
  StreamStarted = 'StreamStarted',
  StreamPaused = 'StreamPaused',
  StreamFinished = 'StreamFinished',
  StreamIsDue = 'StreamIsDue',
  StreamContinued = 'StreamContinued',
  StreamCliffPassed = 'StreamCliffPassed',
  StreamFundsAdded = 'StreamFundsAdded',
}

@Entity()
@Index(['accountId', 'streamId'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  accountId: string;

  @Column()
  streamId: string;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'json', default: {} })
  payload: {
    stream: RoketoStream;
    fundsAdded?: string;
  };
}
