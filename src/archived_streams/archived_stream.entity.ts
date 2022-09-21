import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
export class ArchivedStream {
  @PrimaryColumn()
  streamId: string;
 
  @Index()
  @Column()
  accountId: string;

  @Column({ type: 'timestamp with time zone' })
  startedAt: Date;
  
  @Column({ type: 'timestamp with time zone' })
  finishedAt: Date;

  @Column({ type: 'json', default: {} })
  payload: Record<string, any>;
}
