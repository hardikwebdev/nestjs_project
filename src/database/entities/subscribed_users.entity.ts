import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Users } from './user.entity';
import { TransactionHistory } from './transaction_history.entity';
import { SubscriptionsPlans } from './subscriptions_plans.entity';

enum subscriptionTypeEnum {
  VALUE1 = 'manual', // Done by Admin
  VALUE2 = 'auto', // Done with Payment Gateway
}

@Entity()
export class SubscribedUsers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  plan_id: number;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'tinyint', default: 0 }) //0: Active, 1: Completed, 2: Cancelled
  cron_check: number;

  @Column({
    type: 'enum',
    enum: subscriptionTypeEnum,
    default: subscriptionTypeEnum.VALUE1,
  })
  subscritpion_type: subscriptionTypeEnum;

  @Column({ nullable: true, type: 'bigint' })
  transaction_id: number;

  @Column({ nullable: true, type: 'bigint' })
  customer_profile_id: number;

  @Column({ nullable: true, type: 'bigint' })
  customer_profile_payment_id: number;

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

  @ManyToOne(() => Users, (user) => user.subscriptions)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @OneToMany(
    () => TransactionHistory,
    (transaction_histroy) => transaction_histroy.subscribed_user,
  )
  transaction_histroy: TransactionHistory[];

  @ManyToOne(
    () => SubscriptionsPlans,
    (subscription_plan) => subscription_plan.subscriptions,
  )
  @JoinColumn({ name: 'plan_id' })
  subscription_plan: SubscriptionsPlans;
}
