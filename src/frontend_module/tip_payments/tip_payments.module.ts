import { Module } from '@nestjs/common';
import { TipPaymentController } from './tip_payments.controller';
import { TipPaymentsService } from './tip_payments.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthorizeNetPaymentService } from 'src/authorize_net/authorize_net.service';
import { HelperService } from 'src/helper.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TipPaymentController],
  providers: [TipPaymentsService, AuthorizeNetPaymentService, HelperService],
})
export class TipPaymentModule {}
