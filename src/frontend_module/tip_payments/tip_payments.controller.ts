import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
} from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { TipPaymentsService } from './tip_payments.service';
import { CreateTipPaymentDto } from './dto/createTipPayment.dto';

@ApiCookieAuth()
@Controller('v1/tippayments')
export class TipPaymentController {
  constructor(private tipPaymnetService: TipPaymentsService) {}

  /**
   * Create tip payment and check for the transaction
   * @param param
   * @returns
   */
  @HttpCode(200)
  @Post('/')
  async createTipPaymentAndCheckTransaction(
    @Body() body: CreateTipPaymentDto,
    @Res() res: Response,
  ) {
    return await this.tipPaymnetService.createTipAndMakeTransaction(body, res);
  }
}
