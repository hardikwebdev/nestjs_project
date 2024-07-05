import { Module } from '@nestjs/common';
import { dataSource } from './database.providers';
import { DataSource } from 'typeorm';
import { Users } from './entities/user.entity';
import { BlogPosts } from './entities/blog_posts.entity';
import { LoginHistory } from './entities/login_history.entity';
import { UserActivityLogs } from './entities/user_activity_logs.entity';
import { Authors } from './entities/author.entity';
import { BlogsTags } from './entities/blogs_tag.entity';
import { Tags } from './entities/tags.entity';
import { SubscriptionsPlans } from './entities/subscriptions_plans.entity';
import { SubscribedUsers } from './entities/subscribed_users.entity';
import { TransactionHistory } from './entities/transaction_history.entity';
import { SavedBlogs } from './entities/saved_blogs.entity';
import { BlogsComments } from './entities/blogs_comments.entity';
import { TipPayments } from './entities/tip_payments.entity';

@Module({
  providers: [
    {
      provide: 'DATA_SOURCE', // Provide token
      useFactory: async () => {
        return dataSource.initialize();
      },
    },
    {
      provide: 'USER_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Users),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'BLOG_POSTS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(BlogPosts),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'LOGIN_HISTORY_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(LoginHistory),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'USER_ACTIVITY_LOGS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(UserActivityLogs),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'AUTHOR_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Authors),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'BLOGSTAGS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(BlogsTags),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'TAGS_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Tags),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'SUBSCRIPTION_PLANS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(SubscriptionsPlans),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'SUBSCRIBED_USERS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(SubscribedUsers),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'TRANSACTION_HISTORY_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(TransactionHistory),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'SAVED_BLOGS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(SavedBlogs),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'BLOGS_COMMENT_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(BlogsComments),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'TIP_PAYMENTS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(TipPayments),
      inject: ['DATA_SOURCE'],
    },
  ],
  exports: [
    {
      provide: 'DATA_SOURCE', // Provide token
      useFactory: async () => {
        return dataSource.initialize();
      },
    },
    {
      provide: 'USER_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Users),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'BLOG_POSTS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(BlogPosts),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'LOGIN_HISTORY_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(LoginHistory),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'USER_ACTIVITY_LOGS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(UserActivityLogs),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'AUTHOR_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Authors),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'BLOGSTAGS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(BlogsTags),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'TAGS_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Tags),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'SUBSCRIPTION_PLANS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(SubscriptionsPlans),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'SUBSCRIBED_USERS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(SubscribedUsers),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'TRANSACTION_HISTORY_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(TransactionHistory),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'SAVED_BLOGS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(SavedBlogs),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'BLOGS_COMMENT_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(BlogsComments),
      inject: ['DATA_SOURCE'],
    },
    {
      provide: 'TIP_PAYMENTS_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(TipPayments),
      inject: ['DATA_SOURCE'],
    },
  ],
})
export class DatabaseModule {}
