import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  AfterLoad,
} from 'typeorm';
import * as moment from 'moment';
import { SubscribedUsers } from './subscribed_users.entity';

enum transactionTypeEnum {
  VALUE1 = 'auto_renew', // When subscription is renewed
  VALUE2 = 'expired',
  VALUE3 = 'cancelled',
  VALUE4 = 'subscription', // When subscribed for the first time
}

@Entity()
export class TransactionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  subscription_id: number;

  @Column({
    type: 'enum',
    enum: transactionTypeEnum,
    default: transactionTypeEnum.VALUE1,
  })
  transaction_type: transactionTypeEnum;

  @Column()
  transaction_id: string;

  @Column({ nullable: true, type: 'json' })
  transaction_details: object;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
  })
  deletedAt: Date;

  @ManyToOne(
    () => SubscribedUsers,
    (subscribed_user) => subscribed_user.transaction_histroy,
  )
  @JoinColumn({ name: 'subscription_id' })
  subscribed_user: SubscribedUsers;

  next_renewal_date: string;
  // Method to be called after the entity is loaded
  @AfterLoad()
  afterLoad() {
    // You can perform any actions on the entity after it is loaded
    if (this.end_date) {
      try {
        this.next_renewal_date = moment(this.end_date)
          .add(1, 'days')
          .format('MM-DD-YYYY ');
      } catch (error) {
        this.next_renewal_date = '-';
      }
    } else {
      this.next_renewal_date = '-';
    }
  }
}
