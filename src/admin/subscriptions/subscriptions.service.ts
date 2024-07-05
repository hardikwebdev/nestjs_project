import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { SubscribedUsers } from 'src/database/entities/subscribed_users.entity';
import { SubscriptionsPlans } from 'src/database/entities/subscriptions_plans.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateSubscriptionDto } from './dto/createSubscription.dto';
import { Users } from 'src/database/entities/user.entity';
import * as moment from 'moment';
import { TransactionHistory } from 'src/database/entities/transaction_history.entity';
import { HelperService } from 'src/helper.service';
import { CancelSubscriptionDto } from './dto/cancelSubscription.dto';
import { AuthorizeNetPaymentService } from 'src/authorize_net/authorize_net.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('SUBSCRIBED_USERS_REPOSITORY')
    private subscribedUsersRepository: Repository<SubscribedUsers>,
    @Inject('SUBSCRIPTION_PLANS_REPOSITORY')
    private subscriptionPlansRepository: Repository<SubscriptionsPlans>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<Users>,
    @Inject('TRANSACTION_HISTORY_REPOSITORY')
    private transactionHistoryRepository: Repository<TransactionHistory>,
    private helperService: HelperService,
    private authorizeNetPaymentService: AuthorizeNetPaymentService,
  ) {}

  async getSubscriptionsList(query: any, res: any) {
    const page =
      query.page && parseInt(query.page) == query.page
        ? parseInt(query.page)
        : 1;
    const pageSize =
      query.pageSize && parseInt(query.pageSize) == query.pageSize
        ? parseInt(query.pageSize)
        : 10;
    const skip = (page - 1) * pageSize;

    const sortBy = query.sortBy ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder ? query.sortOrder : 'DESC';

    const queryBuilder: SelectQueryBuilder<SubscribedUsers> =
      this.subscribedUsersRepository
        .createQueryBuilder('subscribed_users')
        .withDeleted()
        .leftJoin('subscribed_users.user', 'user')
        .leftJoin('subscribed_users.transaction_histroy', 'transaction_histroy')
        .leftJoin('subscribed_users.subscription_plan', 'subscription_plan')
        .addSelect([
          'user.id',
          'user.first_name',
          'user.last_name',
          'transaction_histroy.id',
          'transaction_histroy.transaction_type',
          'transaction_histroy.start_date',
          'transaction_histroy.end_date',
          'subscription_plan.id',
          'subscription_plan.package_name',
        ])
        .skip(skip)
        .take(pageSize)
        .orderBy(`subscribed_users.${sortBy}`, sortOrder);

    if (query.search) {
      queryBuilder.andWhere(
        '(user.first_name LIKE :search OR user.last_name LIKE :search OR subscription_plan.package_name LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      queryBuilder.andWhere(
        '(transaction_histroy.transaction_type = :status)',
        {
          status: query.status,
        },
      );
    }

    if (query.start_date && query.end_date) {
      queryBuilder.andWhere(
        '(subscribed_users.start_date >= :startDate AND subscribed_users.start_date <= :endDate)',
        {
          startDate: query.start_date,
          endDate: query.end_date,
        },
      );
    }

    const [subscriptionData, total] = await queryBuilder.getManyAndCount();

    res.locals.responseBody = subscriptionData;
    res.send({ subscriptionData, total });
  }

  async getSubscriptionsPlans(res: any) {
    const subscriptionsPlans = await this.subscriptionPlansRepository.find({
      where: {
        status: 1,
      },
    });

    res.locals.responseBody = subscriptionsPlans;
    res.send({ subscriptionsPlans });
  }

  async subscribeUser(subscrideUserData: CreateSubscriptionDto, res: any) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: {
          id: subscrideUserData.user_id,
        },
      });

      if (!existingUser) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'User not found!',
          },
          HttpStatus.CONFLICT,
        );
      }

      if (existingUser.role !== 2) {
        throw new HttpException(
          {
            code: 'conflict',
            description:
              'Cannot subscribe this user as the user is not authorised for it!',
          },
          HttpStatus.CONFLICT,
        );
      }

      if (existingUser.status !== 1) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'User is disabled or not verified!',
          },
          HttpStatus.CONFLICT,
        );
      }

      const planDetails = await this.subscriptionPlansRepository.findOne({
        where: {
          id: subscrideUserData.plan_id,
        },
      });

      if (!planDetails) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'Subscription plan not found!',
          },
          HttpStatus.CONFLICT,
        );
      }

      const existingActiveSubscription =
        await this.subscribedUsersRepository.findOne({
          where: {
            user_id: subscrideUserData.user_id,
            cron_check: 0,
          },
        });

      if (existingActiveSubscription) {
        await this.cancelPlan(existingActiveSubscription);
      }

      subscrideUserData['subscritpion_type'] = 'manual';
      subscrideUserData['cron_check'] = 0;
      const startDate = moment();
      const endDate = moment(startDate).add(planDetails.days, 'days');
      subscrideUserData['start_date'] = new Date(
        startDate.format('MM-DD-YYYY'),
      );
      subscrideUserData['end_date'] = new Date(endDate.format('MM-DD-YYYY'));
      const subscribeData: any = { ...subscrideUserData };

      const subscriptionData =
        await this.subscribedUsersRepository.insert(subscribeData);

      const transaction_id = this.helperService.generateRandomString(15);
      const transactionHistoryData: any = {
        user_id: subscrideUserData.user_id,
        subscription_id: subscriptionData.generatedMaps[0].id,
        transaction_type: 'subscription',
        transaction_id,
        start_date: subscribeData.start_date,
        end_date: subscribeData.end_date,
      };

      await this.transactionHistoryRepository.insert(transactionHistoryData);

      const responseData = {
        message: 'Subscription created successfully',
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN SUBSCRIBE USER : ', error);
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

  async viewBillingHistory(query: any, res: any) {
    if (!query.user_id) {
      throw new HttpException(
        {
          code: 'conflict',
          description: 'Please provide user id!',
        },
        HttpStatus.CONFLICT,
      );
    }

    const page =
      query.page && parseInt(query.page) == query.page
        ? parseInt(query.page)
        : 1;
    const pageSize =
      query.pageSize && parseInt(query.pageSize) == query.pageSize
        ? parseInt(query.pageSize)
        : 10;
    const skip = (page - 1) * pageSize;

    const sortBy = query.sortBy ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder ? query.sortOrder : 'DESC';

    const queryBuilder: SelectQueryBuilder<TransactionHistory> =
      this.transactionHistoryRepository
        .createQueryBuilder('transaction_histroy')
        .leftJoin('transaction_histroy.subscribed_user', 'subscribed_user')
        .leftJoin('subscribed_user.subscription_plan', 'subscription_plan')
        .addSelect([
          'subscription_plan.id',
          'subscription_plan.package_name',
          'subscribed_user.user_id',
          'subscribed_user.plan_id',
          'subscribed_user.cron_check',
          'subscribed_user.subscritpion_type',
        ])
        .skip(skip)
        .take(pageSize)
        .orderBy(`transaction_histroy.${sortBy}`, sortOrder)
        .where('(transaction_histroy.user_id = :user_id)', {
          user_id: query.user_id,
        });

    if (query.status) {
      queryBuilder.andWhere(
        '(transaction_histroy.transaction_type = :status)',
        {
          status: query.status,
        },
      );
    }

    if (query.start_date && query.end_date) {
      queryBuilder.andWhere(
        '(transaction_histroy.start_date >= :startDate AND transaction_histroy.start_date <= :endDate)',
        {
          startDate: query.start_date,
          endDate: query.end_date,
        },
      );
    }

    const [billingHistoryData, total] = await queryBuilder.getManyAndCount();

    res.locals.responseBody = billingHistoryData;
    res.send({ billingHistoryData, total });
  }

  /**
   * Cancel subscripton plan of user
   * @param body
   * @param res
   * @returns
   */
  async cancelSubscriptionPlan(body: CancelSubscriptionDto, res: any) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: {
          id: body.user_id,
        },
      });

      if (!existingUser) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'User not found!',
          },
          HttpStatus.CONFLICT,
        );
      }

      const existingActiveSubscription =
        await this.subscribedUsersRepository.findOne({
          where: {
            user_id: body.user_id,
            cron_check: 0,
          },
          order: {
            id: 'DESC',
          },
        });

      if (!existingActiveSubscription) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'User does not have any active subscription!',
          },
          HttpStatus.CONFLICT,
        );
      }
      await this.cancelPlan(existingActiveSubscription);
      const responseData = {
        message:
          'Subscription has been cancelled and User downgraded to basic!',
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN CANCEL SUBSCRIPTION PLAN : ', error);
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
   * Cancel user's active plan and create transaction history
   * @param subscribedUserData
   * @returns
   */
  async cancelPlan(existingActiveSubscription: SubscribedUsers) {
    try {
      let transaction_id: any = this.helperService.generateRandomString(15);
      const end_date = new Date(moment().format('MM-DD-YYYY'));
      let transaction_details: any = null;
      if (existingActiveSubscription.subscritpion_type === 'auto') {
        transaction_details =
          await this.authorizeNetPaymentService.cancelSubscription(
            existingActiveSubscription.transaction_id,
          );
        transaction_id = existingActiveSubscription.transaction_id;
      }
      await this.subscribedUsersRepository.update(
        existingActiveSubscription.id,
        {
          cron_check: 2,
          end_date,
        },
      );

      const transactionHistoryData: any = {
        user_id: existingActiveSubscription.user_id,
        subscription_id: existingActiveSubscription.id,
        transaction_type: 'cancelled',
        transaction_id,
        start_date: existingActiveSubscription.start_date,
        end_date,
        transaction_details,
      };

      await this.transactionHistoryRepository.insert(transactionHistoryData);

      const responseData = {
        message:
          'Subscription has been cancelled and User downgraded to basic!',
      };
      return responseData;
    } catch (error) {
      throw new HttpException(error, HttpStatus.CONFLICT);
    }
  }
}
