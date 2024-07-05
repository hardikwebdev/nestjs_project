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
import { BlogPosts } from './blog_posts.entity';

@Entity()
export class SavedBlogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  blog_id: number;

  @Column({ type: Boolean })
  bookmarked: boolean;

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

  @ManyToOne(() => Users, (user) => user.savedblogs)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => BlogPosts, (blogposts) => blogposts.savedblogs)
  @JoinColumn({ name: 'blog_id' })
  blogposts: BlogPosts;
}
