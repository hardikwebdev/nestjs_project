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
import { Tags } from './tags.entity';
import { BlogPosts } from './blog_posts.entity';

@Entity()
export class BlogsTags {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  blog_id: number;

  @Column()
  tag_id: number;

  @Column({ type: 'tinyint', default: 0 }) //0: Inactive, 1: Active
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

  @ManyToOne(() => Tags, (tags) => tags.blogstags)
  @JoinColumn({ name: 'tag_id' })
  tags: Tags;

  @ManyToOne(() => BlogPosts, (blogposts) => blogposts.blogstags)
  @JoinColumn({ name: 'blog_id' })
  blogposts: BlogPosts;
}
