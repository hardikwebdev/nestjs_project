import { Injectable, Inject } from '@nestjs/common';
import { BlogPosts } from 'src/database/entities/blog_posts.entity';
import { BlogsComments } from 'src/database/entities/blogs_comments.entity';
import { Category } from 'src/database/entities/category.entity';
import { SubscribedUsers } from 'src/database/entities/subscribed_users.entity';
import { Users } from 'src/database/entities/user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('BLOG_POSTS_REPOSITORY')
    private blogPostRepository: Repository<BlogPosts>,
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: Repository<Category>,
    @Inject('SUBSCRIBED_USERS_REPOSITORY')
    private subscribedUsersRepository: Repository<SubscribedUsers>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<Users>,
    @Inject('BLOGS_COMMENT_REPOSITORY')
    private blogsCommentRepository: Repository<BlogsComments>,
  ) {}

  async getDashboardData(res: any) {
    const categoryCount = await this.categoryRepository.count({
      where: {
        status: 1,
      },
    });

    const pendingCommentsCount = await this.blogsCommentRepository.count({
      where: {
        status: 0,
      },
    });

    const blogsQueryBuilder: SelectQueryBuilder<BlogPosts> =
      this.blogPostRepository
        .createQueryBuilder('blogposts')
        .where('(blogposts.status = :status)', {
          status: 1,
        })
        .andWhere('(blogposts.post_type = :post_type)', {
          post_type: 'blog',
        });

    const blogsCount = await blogsQueryBuilder.getCount();

    const newsQueryBuilder: SelectQueryBuilder<BlogPosts> =
      this.blogPostRepository
        .createQueryBuilder('blogposts')
        .where('(blogposts.status = :status)', {
          status: 1,
        })
        .andWhere('(blogposts.post_type = :post_type)', {
          post_type: 'news',
        });

    const newsCount = await newsQueryBuilder.getCount();

    const subscriptionCount = await this.subscribedUsersRepository.count({
      where: {
        cron_check: 0,
      },
    });

    const usersCount = await this.userRepository.count({
      where: {
        status: 1,
        role: 2,
      },
    });

    const responseData = {
      message: 'Dashboard data fetched successfully!',
      categoryCount,
      blogsCount,
      newsCount,
      subscriptionCount,
      usersCount,
      pendingCommentsCount,
    };
    res.locals.responseBody = responseData;
    res.send(responseData);
  }
}
