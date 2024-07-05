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
  AfterLoad,
} from 'typeorm';
import { Category } from './category.entity';
import { BlogsTags } from './blogs_tag.entity';
// import { Length } from 'class-validator';
import { Users } from './user.entity';
import { SavedBlogs } from './saved_blogs.entity';
import { BlogsComments } from './blogs_comments.entity';

enum postTypeEnum {
  VALUE1 = 'blog',
  VALUE2 = 'news',
}

enum contentTypeEnum {
  VALUE1 = 'paid',
  VALUE2 = 'free',
}

@Entity()
export class BlogPosts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  user_id: number;

  @Column()
  category_id: number;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ type: 'timestamp', default: null })
  publish_date: Date;

  @Column({ default: null, type: 'text' })
  // @Length(0, 255)
  short_description: string;

  @Column({ default: null, type: 'longtext' })
  long_description: string;

  @Column({ default: null, type: 'text' })
  banner: string;

  @Column({
    type: 'enum',
    enum: postTypeEnum,
    default: postTypeEnum.VALUE1,
  })
  post_type: postTypeEnum;

  @Column({
    type: 'enum',
    enum: contentTypeEnum,
    default: contentTypeEnum.VALUE2,
  })
  content_type: contentTypeEnum;

  @Column({ type: 'tinyint', default: 0 }) //0: Published, 1: Drafted
  drafted: number;

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

  @ManyToOne(() => Users, (author) => author.blogposts)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Category, (category) => category.blogposts)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => BlogsTags, (blogstags) => blogstags.blogposts)
  blogstags: BlogsTags[];

  @OneToMany(() => SavedBlogs, (savedblogs) => savedblogs.blogposts)
  savedblogs: SavedBlogs[];

  @OneToMany(() => BlogsComments, (blogscomment) => blogscomment.blogposts)
  blogscomment: BlogsComments[];

  parsedBanner: string[];

  // Method to be called after the entity is loaded
  @AfterLoad()
  afterLoad() {
    // You can perform any actions on the entity after it is loaded
    if (this.banner) {
      try {
        this.parsedBanner = JSON.parse(this.banner);
      } catch (error) {
        this.parsedBanner = [];
      }
    } else {
      this.parsedBanner = [];
    }

    if (this.blogstags) {
      this.blogstags = this.blogstags.filter((val) => val.status === 1);
    }
  }
}
