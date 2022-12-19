import { RoketoStream } from 'src/common/stream.dto';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
export class NftStream {
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
