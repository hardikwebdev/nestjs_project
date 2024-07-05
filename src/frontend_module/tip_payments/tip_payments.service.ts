import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { TipPayments } from 'src/database/entities/tip_payments.entity';
import { Repository } from 'typeorm';
import { AuthorizeNetPaymentService } from 'src/authorize_net/authorize_net.service';
import { Users } from 'src/database/entities/user.entity';
import { CreateTipPaymentDto } from './dto/createTipPayment.dto';

@Injectable()
export class TipPaymentsService {
  constructor(
    @Inject('TIP_PAYMENTS_REPOSITORY')
    private tipPaymentRepository: Repository<TipPayments>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<Users>,
    private authorizeNetPaymentService: AuthorizeNetPaymentService,
  ) {}

  /**
   * create Tip Payment
   * @param body
   * @param res
   * @returns
   */
  async createTipPayment(tipPaymentData: Partial<TipPayments>, res: any) {
    try {
      const tipPayment = await this.tipPaymentRepository.save(tipPaymentData);
      return tipPayment;
    } catch (error) {
      console.error('ERROR ON CREATE TIP PAYMNET', error);
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
   * Create tip and make transaction
   * @param transactionId
   * @param res
   * @returns
   */
  async createTipAndMakeTransaction(
    createTipData: CreateTipPaymentDto,
    res: any,
  ) {
    try {
      const createTransaction: any =
        await this.authorizeNetPaymentService.makePaymentUsingOpaqueData(
          createTipData,
        );

      const responseCode = createTransaction?.transactionResponse?.responseCode;
      if (!responseCode) {
        throw new HttpException(
          {
            code: 'conflict',
            description:
              createTransaction?.messages?.message[0]?.text ||
              'Transaction not proceed',
          },
          HttpStatus.CONFLICT,
        );
      }

      if (createTipData?.user_id) {
        const user = await this.userRepository.findOneBy({
          id: createTipData.user_id,
        });
        if (!user) {
          throw new HttpException(
            {
              code: 'conflict',
              description: 'User not found!',
            },
            HttpStatus.CONFLICT,
          );
        }
      }

      const tipPaymentData = {
        status: responseCode,
        email: createTipData.email,
        message: createTipData.message,
        amount: createTipData.amount,
        name: createTipData.name,
        user_id: createTipData?.user_id ? createTipData.user_id : null,
        metadata: createTransaction,
        transactionId: createTransaction?.transactionResponse?.transId
          ? createTransaction?.transactionResponse?.transId
          : null,
      };
      await this.createTipPayment(tipPaymentData, res);

      if (responseCode != 1) {
        throw new HttpException(
          {
            code: 'conflict',
            description:
              createTransaction?.transactionResponse?.errors[0]?.errorText ||
              'Transaction not proceed',
          },
          HttpStatus.CONFLICT,
        );
      }
      const responseBody = {
        message:
          createTransaction?.transactionResponse?.messages[0]?.description,
      };
      return res.send(responseBody);
    } catch (error) {
      console.error('ERROR ON UPDATE TRANSACTION', error);
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
