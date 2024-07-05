import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import { SubscribedUsers } from './subscribed_users.entity';

enum durationEnum {
  VALUE1 = 'monthly',
  VALUE2 = 'yearly',
}

@Entity()
export class SubscriptionsPlans {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  package_name: string;

  @Column()
  package_price: string;

  @Column({
    default:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime, temporibus.',
  })
  description: string;

  @Column({ type: 'longtext', default: null })
  sub_description: string;

  @Column({
    type: 'enum',
    enum: durationEnum,
    default: durationEnum.VALUE1,
  })
  duration: durationEnum;

  @Column()
  days: number;

  @Column({ type: 'tinyint', default: 0 }) //0: Disable, 1: Enable
  status: number;

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

  @OneToMany(
    () => SubscribedUsers,
    (subscriptions) => subscriptions.subscription_plan,
  )
  subscriptions: SubscribedUsers[];

  subDescription: string[];
  // Method to be called after the entity is loaded
  @AfterLoad()
  afterLoad() {
    // You can perform any actions on the entity after it is loaded
    if (this.sub_description) {
      try {
        this.subDescription = JSON.parse(this.sub_description);
      } catch (error) {
        this.subDescription = [];
      }
    } else {
      this.subDescription = [];
    }
  }
}
