import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserFTs {
  @PrimaryColumn()
  accountId: string;

  @Column({ type: 'json' })
  list: string[];

  @Column()
  blockTimestamp: string;
}
