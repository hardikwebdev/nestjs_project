import { Module } from '@nestjs/common';
import { UserSubscriptionController } from './user_subscription.controller';
import { UserSubscriptionService } from './user_subscription.service';
import { HelperService } from 'src/helper.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthorizeNetPaymentService } from 'src/authorize_net/authorize_net.service';

@Module({
  controllers: [UserSubscriptionController],
  providers: [
    UserSubscriptionService,
    HelperService,
    AuthorizeNetPaymentService,
  ],
  imports: [DatabaseModule],
})
export class UserSubscriptionModule {}
