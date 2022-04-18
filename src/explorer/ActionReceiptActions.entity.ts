import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ActionReceiptActions {
  @PrimaryColumn()
  receipt_id: string;

  @Column('json')
  args: Record<any, any>;

  @Column()
  receipt_receiver_account_id: string;

  @Column()
  receipt_included_in_block_timestamp: string;
}
