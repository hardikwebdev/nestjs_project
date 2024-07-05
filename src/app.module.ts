import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './admin/auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { HelperService } from './helper.service';
import { AwsModule } from './aws/aws.module';
import { UsersModule } from './admin/users/users.module';
import { SubscriptionsModule } from './admin/subscriptions/subscriptions.module';
import { FrontEndAuthModule } from './frontend_module/auth/auth.module';
import { HomePageModule } from './frontend_module/homepage/homepage.module';
import { BlogsNewsModule } from './frontend_module/blogs_news/blogs_news.module';
import { DashboardModule } from './admin/dashboard/dashboard.module';
import { TipPaymentModule } from './frontend_module/tip_payments/tip_payments.module';
import { AuthorizeNetModule } from './authorize_net/authorize_net.module';
import { UserSubscriptionModule } from './frontend_module/user_subscription/user_subscription.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    RedisModule,
    AwsModule,
    UsersModule,
    SubscriptionsModule,
    FrontEndAuthModule,
    HomePageModule,
    BlogsNewsModule,
    DashboardModule,
    TipPaymentModule,
    AuthorizeNetModule,
    UserSubscriptionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'jwt',
    },
    HelperService,
  ],
  exports: [HelperService],
})
export class AppModule {}
