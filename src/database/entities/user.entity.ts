import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { SubscribedUsers } from './subscribed_users.entity';
import { BlogPosts } from './blog_posts.entity';
import { SavedBlogs } from './saved_blogs.entity';
import { BlogsComments } from './blogs_comments.entity';
import { TipPayments } from './tip_payments.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: null, type: 'text' })
  address: string;

  @Column({ default: null, type: 'text' })
  bio: string;

  @Column({ default: null })
  latitude: string;

  @Column({ default: null })
  longitude: string;

  @Column({ default: null, type: 'text' })
  profile_url: string;

  @Column({ type: 'tinyint', default: 2 }) // 0 = Admin, 1 = Testers, 2 = Users
  role: number;

  @Column({ default: null, type: 'text' })
  reset_token: string;

  @Column({ default: null, type: 'text' })
  invitation_token: string;

  @Column({ type: 'tinyint', default: 0 }) //0: Inactive or Disable, 1: Active or Enable, 2: Invitation Accept Pending, 3: Users verification pending
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

  @OneToMany(() => SubscribedUsers, (subscriptions) => subscriptions.user)
  subscriptions: SubscribedUsers[];

  @OneToMany(() => BlogPosts, (blogposts) => blogposts.user)
  blogposts: BlogPosts[];

  @OneToMany(() => SavedBlogs, (savedblogs) => savedblogs.user)
  savedblogs: SavedBlogs[];

  @OneToMany(() => BlogsComments, (blogscomments) => blogscomments.user)
  blogscomments: BlogsComments[];

  @OneToMany(() => TipPayments, (tipPayment) => tipPayment.user)
  tipPayments: TipPayments[];
}
