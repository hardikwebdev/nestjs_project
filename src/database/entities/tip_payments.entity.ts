import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity()
export class TipPayments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  customerId: string;

  @Column({ nullable: false, type: 'double' })
  amount: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  message: string;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @Column({ type: 'tinyint', default: 0 }) //0: Pending, 1: Approved, 2: Declined, 3: Error, 4: HELD_FOR_REVIEW
  status: number;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ type: 'bigint', nullable: true })
  purchaseOrderNumber: number;

  @Column({ nullable: true })
  user_id: number;

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
}
