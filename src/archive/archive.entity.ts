import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['accountId', 'streamId'])
export class Archive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  accountId: string;

  @Column()
  streamId: string;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'json', default: {} })
  payload: Record<string, any>;
}
