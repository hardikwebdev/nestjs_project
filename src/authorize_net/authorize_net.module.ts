import { Module } from '@nestjs/common';
import { AuthorizeNetPaymentService } from './authorize_net.service';
import { HelperService } from 'src/helper.service';
import { AuthorizeNetWebhookController } from './authorize_net.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthorizeNetWebhookController],
  providers: [AuthorizeNetPaymentService, HelperService],
  exports: [AuthorizeNetPaymentService],
})
export class AuthorizeNetModule {}
