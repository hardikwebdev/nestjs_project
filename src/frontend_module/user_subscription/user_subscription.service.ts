import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SubscribedUsers } from 'src/database/entities/subscribed_users.entity';
import { SubscriptionsPlans } from 'src/database/entities/subscriptions_plans.entity';
import { TransactionHistory } from 'src/database/entities/transaction_history.entity';
import { Users } from 'src/database/entities/user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateUserSubscriptionDto } from './dto/createSubscription.dto';
import { AuthorizeNetPaymentService } from 'src/authorize_net/authorize_net.service';
import { SubscriptionDataDto } from 'src/authorize_net/dto/subscriptionData.dto';
import * as moment from 'moment';
import { HelperService } from 'src/helper.service';

@Injectable()
export class UserSubscriptionService {
  constructor(
    @Inject('SUBSCRIBED_USERS_REPOSITORY')
    private subscribedUsersRepository: Repository<SubscribedUsers>,
    @Inject('SUBSCRIPTION_PLANS_REPOSITORY')
    private subscriptionPlansRepository: Repository<SubscriptionsPlans>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<Users>,
    @Inject('TRANSACTION_HISTORY_REPOSITORY')
    private transactionHistoryRepository: Repository<TransactionHistory>,
    private readonly authorizeNetPaymentService: AuthorizeNetPaymentService,
    private readonly helperService: HelperService,
  ) {}

  /**
   * Create subscription
   * @param res
   * @param req
   * @param subscriptionData
   * @returns
   */
  async createSubscription(
    res: any,
    req: any,
    subscriptionData: CreateUserSubscriptionDto,
  ) {
    try {
      if (!req?.user?.id) {
        throw new HttpException(
          {
            code: 'Unauthorized',
            description: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const plan = await this.getPlanDetailsById(subscriptionData.plan_id);
      if (!plan) {
        throw new HttpException(
          {
            code: 'Conflict',
            description: 'Plan not found!',
          },
          HttpStatus.CONFLICT,
        );
      }

      const user: Users = await this.getUserById(req.user.id);
      if (user?.subscriptions[0]?.plan_id === plan.id) {
        throw new HttpException(
          {
            message: 'User already have this active plan',
            code: 'Conflict',
          },
          HttpStatus.CONFLICT,
        );
      }
      if (plan.package_price != '0') {
        let intervalLength = 1;
        if (plan.duration === 'yearly') {
          intervalLength = 12;
        }
        const subscriptionCreateData: SubscriptionDataDto = {
          firstName: user.first_name,
          lastName: user.last_name,
          amount: parseInt(plan.package_price),
          email: user.email,
          opaqueDataValue: subscriptionData.dataValue,
          planName: plan.package_name,
          intervalLength,
          occuranceDuration: 'months',
        };

        const subscribeData =
          await this.authorizeNetPaymentService.createSubscriptionUsingOpaque(
            subscriptionCreateData,
          );

        if (subscribeData.messages?.resultCode === 'Error') {
          throw new HttpException(
            {
              code: 'conflict',
              description: 'Subscription create failed',
            },
            HttpStatus.CONFLICT,
          );
        }
        const startDate = moment();
        const endDate = moment(startDate).add(plan.days, 'days');
        const userSubscriptionData: any = {
          user_id: user.id,
          plan_id: subscriptionData.plan_id,
          subscritpion_type: 'auto',
          transaction_id: subscribeData.subscriptionId,
          customer_profile_id: subscribeData.profile.customerProfileId,
          customer_profile_payment_id:
            subscribeData.profile.customerPaymentProfileId,
          start_date: new Date(startDate.format('MM-DD-YYYY')),
          end_date: new Date(endDate.format('MM-DD-YYYY')),
        };
        const subscribedUser =
          await this.createSubscriptionOfUser(userSubscriptionData);
        const transactionHistoryData: any = {
          user_id: user.id,
          subscription_id: subscribedUser.id,
          transaction_type: 'subscription',
          transaction_id: subscribeData.subscriptionId,
          start_date: new Date(startDate.format('MM-DD-YYYY')),
          end_date: new Date(endDate.format('MM-DD-YYYY')),
          transaction_details: subscribeData,
        };
        await this.createTransactionHistory(transactionHistoryData);
      }

      /**
       * Cancel or update user's subcription
       */
      let cancelSubscription: any = null;
      let transaction_id: any = this.helperService.generateRandomString(15);
      if (user?.subscriptions[0]?.id) {
        if (user?.subscriptions[0]?.transaction_id) {
          cancelSubscription =
            await this.authorizeNetPaymentService.cancelSubscription(
              user.subscriptions[0].transaction_id,
            );
          transaction_id = user.subscriptions[0].transaction_id;
        }

        const cancelSubHistoryData: any = {
          user_id: user.id,
          plan_id: user.subscriptions[0].plan_id,
          transaction_type: 'cancelled',
          transaction_id,
          start_date: user.subscriptions[0].start_date,
          end_date: new Date(moment().format('MM-DD-YYYY')),
          subscription_id: user.subscriptions[0].id,
          transaction_details: cancelSubscription,
        };
        await this.createTransactionHistory(cancelSubHistoryData);
      }
      if (user?.subscriptions[0]?.id) {
        await this.updateSubscriptionById(user.subscriptions[0].id, {
          cron_check: 2,
          end_date: new Date(moment().format('MM-DD-YYYY')),
        });
      }
      return res.send({ message: 'Subscription created successfully' });
    } catch (error) {
      console.error('ERROR ON CREATE SUBSCRIPTION', error);
      if (error.getResponse && typeof error.getResponse === 'function') {
        res.locals.responseBody = await error.getResponse();
        return res.status(error.getStatus()).json(error.getResponse());
      } else {
        res.locals.responseBody = 'An unexpected error occurred';
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred.',
        });
      }
    }
  }

  /**
   * Get subscription plan details by id
   * @param id
   * @param res
   * @returns
   */
  async getPlanDetailsById(id: number) {
    return await this.subscriptionPlansRepository.findOneBy({
      id,
    });
  }

  /**
   * Get user by id
   * @param id
   * @returns
   */
  async getUserById(id: number): Promise<Users> {
    const subscriptionDataQuery: SelectQueryBuilder<Users> = this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect(
        'users.subscriptions',
        'subscriptions',
        'subscriptions.cron_check = :cron_check',
        { cron_check: 0 },
      )
      .addSelect(['subscriptions.id', 'subscriptions.cron_check'])
      .where('(users.id = :id)', {
        id,
      });
    return await subscriptionDataQuery.getOne();
  }

  /**
   * Create subscripton of user
   * @param userSubscription
   * @returns
   */
  async createSubscriptionOfUser(userSubscription: Partial<SubscribedUsers>) {
    return await this.subscribedUsersRepository.save(userSubscription);
  }

  /**
   * Create transaction history
   * @param userSubscription
   * @returns
   */
  async createTransactionHistory(
    userSubscription: Partial<TransactionHistory>,
  ) {
    return await this.transactionHistoryRepository.save(userSubscription);
  }

  /**
   * Update subscription by id
   * @param subscriptionId
   * @returns
   */
  async updateSubscriptionById(
    id: number,
    subscribedData: Partial<SubscribedUsers>,
  ) {
    return await this.subscribedUsersRepository.update(
      {
        id,
      },
      subscribedData,
    );
  }

  /**
   * Get active subsctiptions plans
   * @param res
   */
  async getSubscriptionPlans(res: any) {
    try {
      const subscriptionPlans = await this.subscriptionPlansRepository.findBy({
        status: 1,
      });
      res.locals.responseBody = subscriptionPlans;
      return res.send(subscriptionPlans);
    } catch (error) {
      console.error('ERROR ON GET SUBSCRIPTION PLANS', error);
      if (error.getResponse && typeof error.getResponse === 'function') {
        res.locals.responseBody = await error.getResponse();
        return res.status(error.getStatus()).json(error.getResponse());
      } else {
        res.locals.responseBody = 'An unexpected error occurred';
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred.',
        });
      }
    }
  }
}
