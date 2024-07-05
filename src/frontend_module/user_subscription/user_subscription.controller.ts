import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserSubscriptionService } from './user_subscription.service';
import { JwtFrontAuthGuard } from '../homepage/jwt-front-auth.gaurd';
import { CreateUserSubscriptionDto } from './dto/createSubscription.dto';

@Controller('v1/subscription')
export class UserSubscriptionController {
  constructor(private readonly subscriptionService: UserSubscriptionService) {}

  /**
   * Create user subscription
   * @param body
   * @param res
   * @param req
   * @returns
   */
  @UseGuards(JwtFrontAuthGuard)
  @Post('')
  async createSubscription(
    @Body() subscriptionData: CreateUserSubscriptionDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return await this.subscriptionService.createSubscription(
      res,
      req,
      subscriptionData,
    );
  }

  /**
   * Get subscription plans
   * @param req
   * @returns
   */
  @UseGuards(JwtFrontAuthGuard)
  @Get('plans')
  async getSubscriptionPlans(@Res() res: Response) {
    return await this.subscriptionService.getSubscriptionPlans(res);
  }
}
