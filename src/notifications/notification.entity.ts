import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

export enum NotificationType {
  StreamCreated = 'StreamCreated',
}

@Entity()
export class Notification {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column()
  accountId: string;

  @Column({ type: 'numeric', precision: 20, scale: 0 })
  createdAt: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'json', default: {} })
  payload: Record<string, any>;
}
