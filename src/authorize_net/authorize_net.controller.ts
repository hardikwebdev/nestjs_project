import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthorizeNetPaymentService } from './authorize_net.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('v1/webhook')
export class AuthorizeNetWebhookController {
  constructor(
    private readonly authorizeNetPaymentService: AuthorizeNetPaymentService,
  ) {}

  @HttpCode(200)
  @Post('')
  async listenWebhook(@Body() body: any) {
    const { eventType, payload } = body;

    fs.appendFileSync(
      path.join(__dirname, '../../logs.txt'),
      `\n${JSON.stringify(body)}`,
    );
    return await this.authorizeNetPaymentService.updateSubscriptionRenewal(
      eventType,
      payload,
    );
  }
}
