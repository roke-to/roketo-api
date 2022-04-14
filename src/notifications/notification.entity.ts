import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  StreamCreated = 'StreamCreated',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  accountId: string;

  @CreateDateColumn()
  createdAt: number;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'json', default: {} })
  payload: Record<string, any>;
}
