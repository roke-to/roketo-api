import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum NotificationType {
  StreamStarted = 'StreamStarted',
  StreamPaused = 'StreamPaused',
  StreamFinished = 'StreamFinished',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  accountId: string;

  @Column({ type: 'bigint' })
  createdAt: number;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'json', default: {} })
  payload: Record<string, any>;
}
