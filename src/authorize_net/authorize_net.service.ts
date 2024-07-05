import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { APIContracts, APIControllers } from 'authorizenet';
import { SubscriptionDataDto } from './dto/subscriptionData.dto';
import { CreateTipPaymentDto } from 'src/frontend_module/tip_payments/dto/createTipPayment.dto';
import { Repository } from 'typeorm';
import { TransactionHistory } from 'src/database/entities/transaction_history.entity';
import { SubscribedUsers } from 'src/database/entities/subscribed_users.entity';
import * as moment from 'moment';

@Injectable()
export class AuthorizeNetPaymentService {
  private merchantAuthentication =
    new APIContracts.MerchantAuthenticationType();

  constructor(
    @Inject('TRANSACTION_HISTORY_REPOSITORY')
    private transactionHistoryRepository: Repository<TransactionHistory>,
    @Inject('SUBSCRIBED_USERS_REPOSITORY')
    private subscribedUsersRepository: Repository<SubscribedUsers>,
  ) {
    this.merchantAuthentication.setTransactionKey(
      process.env.AUTHORIZE_TRANSACTION_KEY,
    );
    this.merchantAuthentication.setName(process.env.AUTHORIZE_LOGIN_ID);
  }

  /**
   * Make paymnet using opaque data
   * @param opaqueData
   * @param res
   */
  async makePaymentUsingOpaqueData(createTip: Partial<CreateTipPaymentDto>) {
    try {
      const opaqueTransaction = new APIContracts.OpaqueDataType();
      opaqueTransaction.dataDescriptor = 'COMMON.ACCEPT.INAPP.PAYMENT';
      opaqueTransaction.dataValue = createTip.data_value;

      const paymentType = new APIContracts.PaymentType();
      paymentType.setOpaqueData(opaqueTransaction);

      const customer = new APIContracts.CustomerProfileType();
      customer.setEmail(createTip.email);
      const transactionRequestType = new APIContracts.TransactionRequestType();
      transactionRequestType.setTransactionType(
        APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION,
      );
      transactionRequestType.setPayment(paymentType);
      transactionRequestType.setCustomer(customer);
      transactionRequestType.setAmount(createTip.amount);

      const createRequest = new APIContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(this.merchantAuthentication);
      createRequest.setTransactionRequest(transactionRequestType);

      const ctrl = new APIControllers.CreateTransactionController(
        createRequest.getJSON(),
      );
      const response: any = await new Promise((resolve) => {
        ctrl.execute(async () => {
          const getResponse = await ctrl.getResponse();
          resolve(getResponse);
        });
      });
      return response;
    } catch (error) {
      console.error('Error on create Transaction', error);
      throw new HttpException(error, HttpStatus.CONFLICT);
    }
  }

  /**
   * Get transaction by id
   * @param id
   * @returns
   */
  async getTransactionById(id: number) {
    try {
      const getRequest = new APIContracts.GetTransactionDetailsRequest();
      getRequest.setMerchantAuthentication(this.merchantAuthentication);
      getRequest.setTransId(id);

      const ctrl = new APIControllers.CreateTransactionController(
        getRequest.getJSON(),
      );
      const response: any = await new Promise((resolve) => {
        ctrl.execute(async () => {
          const getResponse = await ctrl.getResponse();
          resolve(getResponse);
        });
      });
      if (response?.messages?.resultCode === 'Error') {
        throw new HttpException(
          response?.messages?.message[0]?.text || 'Transaction not found!',
          HttpStatus.CONFLICT,
        );
      }
      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Create subscriptoin using hosted payment
   * @param subscriptionData
   * @returns
   */
  async createSubscriptionUsingOpaque(subscriptionData: SubscriptionDataDto) {
    try {
      const opaqueTransaction = new APIContracts.OpaqueDataType();
      opaqueTransaction.dataDescriptor = 'COMMON.ACCEPT.INAPP.PAYMENT';
      opaqueTransaction.dataValue = subscriptionData.opaqueDataValue;

      const paymentType = new APIContracts.PaymentType();
      paymentType.setOpaqueData(opaqueTransaction);

      const interval = new APIContracts.PaymentScheduleType.Interval();
      interval.setLength(subscriptionData.intervalLength);
      interval.setUnit(subscriptionData.occuranceDuration);

      const paymentScheduleType = new APIContracts.PaymentScheduleType();
      paymentScheduleType.setInterval(interval);
      paymentScheduleType.setStartDate(
        new Date().toISOString().substring(0, 10),
      );
      paymentScheduleType.setTotalOccurrences(9999);
      paymentScheduleType.setTrialOccurrences(0);

      const payment = new APIContracts.PaymentType();
      payment.setOpaqueData(opaqueTransaction);

      const customer = new APIContracts.CustomerType();
      customer.setEmail(subscriptionData.email);

      const nameAndAddressType = new APIContracts.NameAndAddressType();
      nameAndAddressType.setFirstName(subscriptionData.firstName);
      nameAndAddressType.setLastName(subscriptionData.lastName);

      const subscription = new APIContracts.ARBSubscriptionType();
      subscription.setCustomer(customer);
      subscription.setPayment(payment);
      subscription.setTrialAmount(0);
      subscription.setPaymentSchedule(paymentScheduleType);
      subscription.setAmount(subscriptionData.amount);
      subscription.setBillTo(nameAndAddressType);
      subscription.setName(subscriptionData.planName);

      const createRequest = new APIContracts.ARBCreateSubscriptionRequest();
      createRequest.setMerchantAuthentication(this.merchantAuthentication);
      createRequest.setSubscription(subscription);

      const ctrl = new APIControllers.CreateTransactionController(
        createRequest.getJSON(),
      );
      const response: any = await new Promise((resolve) => {
        ctrl.execute(async () => {
          const getResponse = await ctrl.getResponse();
          resolve(getResponse);
        });
      });
      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.CONFLICT);
    }
  }

  /**
   * Get subscription by id
   * @param id
   * @returns
   */
  async getSubscriptionById(id: number) {
    try {
      const getRequest = new APIContracts.ARBGetSubscriptionRequest();
      getRequest.setMerchantAuthentication(this.merchantAuthentication);
      getRequest.setSubscriptionId(id);
      getRequest.includeTransactions = true;
      const ctrl = new APIControllers.ARBGetSubscriptionController(
        getRequest.getJSON(),
      );
      const response: any = await new Promise((resolve) => {
        ctrl.execute(async () => {
          const getResponse = await ctrl.getResponse();
          resolve(getResponse);
        });
      });
      if (response?.messages?.resultCode === 'Error') {
        throw new HttpException(
          response?.messages?.message[0]?.text || 'Subscription not found',
          HttpStatus.CONFLICT,
        );
      }
      return response;
    } catch (error) {
      console.error('ERROR ON GET SUBSCRIPTION BY ID', error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Cancel subscription using id
   * @param id
   * @returns
   */
  async cancelSubscription(id: number) {
    try {
      const cancelRequest = new APIContracts.ARBCancelSubscriptionRequest();
      cancelRequest.setMerchantAuthentication(this.merchantAuthentication);
      cancelRequest.setSubscriptionId(id);
      const request = new APIControllers.ARBCancelSubscriptionController(
        cancelRequest.getJSON(),
      );
      const response: any = await new Promise((resolve) => {
        request.execute(async () => {
          const getResponse = await request.getResponse();
          resolve(getResponse);
        });
      });
      return response;
    } catch (error) {
      console.error('ERROR ON CANCEL SUBSCRIPTION BY ID', error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Update database as per webhook listen for recurring billing
   * @param eventType
   * @param payload
   * @returns
   */
  async updateSubscriptionRenewal(eventType: string, payload: any) {
    if (eventType === 'net.authorize.payment.authcapture.created') {
      const { id } = payload;
      const { transaction } = await this.getTransactionById(id);
      const responseCode = transaction?.responseCode;
      const { subscription } = transaction;
      if (subscription && subscription.payNum >= 2) {
        const getSubscription = await this.getSubscriptionById(subscription.id);
        const subscribedUser: SubscribedUsers =
          await this.findSubscribedUserById(subscription.id);
        if (subscribedUser) {
          const end_date = new Date(
            moment(moment())
              .add(subscribedUser.subscription_plan.days, 'days')
              .format('MM-DD-YYYY'),
          );
          const transactionHistoryData: any = {
            user_id: subscribedUser.user_id,
            transaction_id: subscription.id,
            start_date: subscribedUser.start_date,
            end_date:
              responseCode === 1 || responseCode === 4
                ? end_date
                : subscribedUser.end_date,
            customer_profile_id:
              getSubscription?.subscription?.profile?.customerProfileId,
            customer_profile_payment_id:
              getSubscription?.subscription?.profile?.paymentProfile
                ?.customerPaymentProfileId,
            transaction_type: 'auto_renew',
            transaction_details: transaction,
          };
          await this.subscribedUsersRepository.update(
            {
              transaction_id: subscription.id,
            },
            {
              end_date:
                responseCode === 1 || responseCode === 4
                  ? end_date
                  : subscribedUser.end_date,
            },
          );
          await this.createTransactionHistory(transactionHistoryData);
        }
      }
      return;
    }
    return;
  }

  /**
   * Get active subscribed user by transaction id
   * @param transaction_id
   * @returns
   */
  async findSubscribedUserById(transaction_id: any) {
    const subscribedUser = await this.subscribedUsersRepository.findOne({
      where: { cron_check: 0, transaction_id },
      relations: {
        subscription_plan: true,
      },
    });
    return subscribedUser;
  }

  /**
   * Create transaction history for subscription
   * @param transactionHistoryData
   * @returns
   */
  async createTransactionHistory(
    transactionHistoryData: Partial<TransactionHistory>,
  ) {
    return await this.transactionHistoryRepository.insert(
      transactionHistoryData,
    );
  }
}
