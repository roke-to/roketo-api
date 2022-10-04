import { RoketoStream } from 'src/common/contract.types';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ArchivedStream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  streamId: string;
 
  @Index()
  @Column()
  accountId: string;

  @Column({ type: 'timestamp with time zone' })
  startedAt: Date;
  
  @Column({ type: 'timestamp with time zone' })
  finishedAt: Date;

  @Column({ type: 'json', default: {} })
  payload: {
    stream: RoketoStream
  };
}
