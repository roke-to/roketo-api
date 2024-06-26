import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserFt {
  @PrimaryColumn()
  accountId: string;

  @Column({ type: 'json' })
  list: string[];

  @Column()
  blockTimestamp: string;
}
