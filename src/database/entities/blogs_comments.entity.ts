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
import { BlogPosts } from './blog_posts.entity';
import { Users } from './user.entity';

@Entity()
export class BlogsComments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  user_id: number;

  @Column()
  blog_id: number;

  @Column({ type: 'longtext' })
  comment: string;

  @Column({ type: 'tinyint', default: 0 }) // 0 = Pending 1 = Approved 2 = Rejected
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

  @ManyToOne(() => BlogPosts, (blogposts) => blogposts.blogscomment)
  @JoinColumn({ name: 'blog_id' })
  blogposts: BlogPosts;

  @ManyToOne(() => Users, (users) => users.blogscomments)
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
