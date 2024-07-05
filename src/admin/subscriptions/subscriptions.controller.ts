import {
  Controller,
  UseGuards,
  Get,
  HttpCode,
  Query,
  Res,
  Post,
  Body,
} from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../category/jwt-auth.guard';
import { SubscriptionService } from './subscriptions.service';
import { CommonGetDto } from 'src/commonGet.dto';
import { CreateSubscriptionDto } from './dto/createSubscription.dto';
import { CancelSubscriptionDto } from './dto/cancelSubscription.dto';

@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('/admin/subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('/')
  @HttpCode(200)
  getSubscriptionsList(
    @Query() query: CommonGetDto,
    @Res() res: Response,
  ): any {
    return this.subscriptionService.getSubscriptionsList(query, res);
  }

  @Get('/getSubscriptionsPlans')
  @HttpCode(200)
  getSubscriptionsPlans(@Res() res: Response): any {
    return this.subscriptionService.getSubscriptionsPlans(res);
  }

  @Post('/subscribeUser')
  @HttpCode(200)
  subscribeUser(
    @Body() body: CreateSubscriptionDto,
    @Res() res: Response,
  ): any {
    return this.subscriptionService.subscribeUser(body, res);
  }

  @Post('/cancelPlan')
  @HttpCode(200)
  cancelPlan(@Body() body: CancelSubscriptionDto, @Res() res: Response): any {
    return this.subscriptionService.cancelSubscriptionPlan(body, res);
  }

  @Get('/viewBillingHistory')
  @HttpCode(200)
  viewBillingHistory(@Query() query: CommonGetDto, @Res() res: Response): any {
    return this.subscriptionService.viewBillingHistory(query, res);
  }
}
