import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  accountId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;
}
