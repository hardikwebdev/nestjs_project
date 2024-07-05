import { Module, MiddlewareConsumer } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { LogsMiddleware } from '../middleware/logs.middleware';
import { SubscriptionsController } from './subscriptions.controller';
import { JwtStrategy } from '../category/jwt.strategy';
import { SubscriptionService } from './subscriptions.service';
import { HelperService } from 'src/helper.service';
import { AuthorizeNetPaymentService } from 'src/authorize_net/authorize_net.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SubscriptionsController],
  providers: [
    JwtStrategy,
    SubscriptionService,
    HelperService,
    AuthorizeNetPaymentService,
  ],
})
export class SubscriptionsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes(SubscriptionsController);
  }
}
