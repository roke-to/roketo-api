import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserNft {
  @PrimaryColumn()
  accountId: string;

  @Column({ type: 'json' })
  list: string[];

  @Column()
  blockTimestamp: string;
}
