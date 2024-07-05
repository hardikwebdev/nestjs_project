import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Users } from 'src/database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as request from 'request-promise';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { LoginHistory } from 'src/database/entities/login_history.entity';
import { SignUpDto } from './dto/signup.dto';
import { VerifyUserDto } from './dto/verifyUser.dto';
import { ForgotPasswordDto } from 'src/admin/auth/dto/forgotpassword.dto';
import { ResetPasswordDto } from 'src/admin/auth/dto/resetpassword.dto';
import { AcceptInviationDto } from './dto/acceptInvitation.dto';
import { LoginDto } from './dto/login.dto';
import { GeneralConfigurationService } from 'src/admin/configuration/generalconfiguration/general_configuration.service';
import { SubscribedUsers } from 'src/database/entities/subscribed_users.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<Users>,
    @Inject('LOGIN_HISTORY_REPOSITORY')
    private loginHistoryRepository: Repository<LoginHistory>,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
    @Inject('SUBSCRIBED_USERS_REPOSITORY')
    private subscribedUsersRepository: Repository<SubscribedUsers>,
    private readonly generalConfigService: GeneralConfigurationService,
  ) {}

  async signUp(userData: SignUpDto, res: any) {
    try {
      const response = await request.post(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          form: {
            secret: process.env.RECAPTCHA_SCERET_KEY,
            response: userData.reCaptchaToken,
          },
          json: true,
        },
      );

      if (!response.success) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'CAPTCHA verification failed',
          },
          HttpStatus.CONFLICT,
        );
      }

      const existingUser = await this.userRepository.findOne({
        where: {
          email: userData.email,
        },
      });

      if (existingUser) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'User with the same email address already exists!',
          },
          HttpStatus.CONFLICT,
        );
      }

      const encryptedPassword = await bcrypt.hash(userData.password, 12);
      userData.password = encryptedPassword;
      userData['status'] = 3; // Set to 3 because the verification of the email is pending

      await this.userRepository.insert(userData);

      const jwtVerificationToken = this.jwtService.sign(
        {
          email: userData.email,
        },
        {
          secret: process.env.JWT_SECRET_KEY,
          expiresIn: '24h', // Set the expiration time here
        },
      );

      const generalConfigData =
        await this.generalConfigService.getGeneralConfigurationFunc();

      // CHANGE REQUIRED in the EMAIL Template and also change the verification URL
      const htmlData = await this.emailService.renderTemplate(
        './views/email/verificationEmail.hbs',
        {
          subject: 'Verification Email', // pass the required parameters on the hbs
          verificationUrl: `${process.env.FRONTEND_URL}/account/set-password?email=${userData.email}&&verificationToken=${jwtVerificationToken}`,
          logo: generalConfigData.site_logo,
          mailTo: process.env.SUPPORT_EMAIL,
        },
      );

      await this.emailService.sendMail(
        userData.email,
        'Verification Email', // Email Verification
        '',
        htmlData,
      );

      const responseData = {
        message:
          'Registered successfully! Please check your email to complete verification process',
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN SIGN UP : ', error);
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

  async resedVerificationEmail(userData: ForgotPasswordDto, res: any) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: {
          email: userData.email,
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

      if (existingUser.status === 0) {
        throw new HttpException(
          {
            code: 'conflict',
            description:
              'Your account has been inactvated! Please contact support to proceed further.',
          },
          HttpStatus.CONFLICT,
        );
      }

      if (existingUser.status === 1) {
        throw new HttpException(
          {
            code: 'conflict',
            description:
              'Account has already been verified! Please login to continue.',
          },
          HttpStatus.CONFLICT,
        );
      }

      const jwtVerificationToken = this.jwtService.sign(
        {
          email: userData.email,
        },
        {
          secret: process.env.JWT_SECRET_KEY,
          expiresIn: '24h', // Set the expiration time here
        },
      );

      const generalConfigData =
        await this.generalConfigService.getGeneralConfigurationFunc();

      // CHANGE REQUIRED in the EMAIL Template and also change the verification URL
      const htmlData = await this.emailService.renderTemplate(
        './views/email/verificationEmail.hbs',
        {
          subject: 'Verification Email', // pass the required parameters on the hbs
          verificationUrl: `${process.env.FRONTEND_URL}/account/set-password?email=${userData.email}&&verificationToken=${jwtVerificationToken}`,
          logo: generalConfigData.site_logo,
          mailTo: process.env.SUPPORT_EMAIL,
        },
      );

      await this.emailService.sendMail(
        userData.email,
        'Verification Email', // Email Verification
        '',
        htmlData,
      );

      const responseData = {
        message: 'Verification email has been resent successfully!',
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN RESEND VERIFICATION EMAIL : ', error);
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

  async verifyUser(userData: VerifyUserDto, res: any) {
    try {
      let jwtVerified: any;
      try {
        jwtVerified = this.jwtService.verify(userData.verificationToken, {
          secret: process.env.JWT_SECRET_KEY,
        });
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new HttpException(
            {
              code: 'token_expired',
              description: 'Token has expired',
            },
            HttpStatus.UNAUTHORIZED,
          );
        } else if (error.name === 'JsonWebTokenError') {
          throw new HttpException(
            {
              code: 'token_invalid',
              description: 'Invalid token',
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      const userExists: Users = await this.userRepository.findOne({
        where: {
          email: jwtVerified.email,
        },
      });

      if (!userExists) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'No User Found!',
          },
          HttpStatus.CONFLICT,
        );
      }

      if (userExists.status !== 3) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'Already verified please login to continue!',
          },
          HttpStatus.CONFLICT,
        );
      }

      await this.userRepository.update(userExists.id, {
        status: 1,
      });

      const responseData = {
        message: 'Verification done successfully!',
        access_token: this.jwtService.sign(
          { userId: userExists.id },
          {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: '48h', // Set the expiration time here
          },
        ),
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN USER VERIFICATION : ', error);
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

  async login(userData: LoginDto, req: Request) {
    const response = await request.post(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        form: {
          secret: process.env.RECAPTCHA_SCERET_KEY,
          response: userData.reCaptchaToken,
        },
        json: true,
      },
    );

    if (!response.success) {
      throw new HttpException(
        {
          code: 'conflict',
          description: 'CAPTCHA verification failed',
        },
        HttpStatus.CONFLICT,
      );
    }

    const userExists: Users = await this.userRepository.findOne({
      where: {
        email: userData.email,
      },
    });

    if (!userExists) {
      throw new HttpException(
        {
          code: 'conflict',
          description: 'No User Found!',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (userExists.role !== 2) {
      throw new HttpException(
        {
          code: 'unauthorized',
          description: 'Unauthorised User!',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (userExists.status != 1) {
      throw new HttpException(
        {
          code: 'conflict',
          description: 'Your account is inactive or not verified!',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordMatch = await bcrypt.compare(
      userData.password,
      userExists.password,
    );

    if (!isPasswordMatch) {
      throw new HttpException(
        {
          code: 'unauthorized',
          description: 'Wrong credentials!',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userAgentDetails = req.headers['user-agent'];
    await this.loginHistoryRepository.insert({
      user_id: userExists.id,
      user_agent: userAgentDetails ? JSON.stringify(userAgentDetails) : null,
    });

    delete userExists.password;

    const subscriptionDataQuery: SelectQueryBuilder<SubscribedUsers> =
      this.subscribedUsersRepository
        .createQueryBuilder('subscribed_users')
        .leftJoin('subscribed_users.subscription_plan', 'subscription_plan')
        .addSelect(['subscription_plan.id', 'subscription_plan.package_name'])
        .orderBy(`subscribed_users.id`, 'DESC')
        .where('(subscribed_users.user_id = :user_id)', {
          user_id: userExists.id,
        })
        .andWhere('(subscribed_users.cron_check = :cron_check)', {
          cron_check: 0,
        });

    userExists['subscriptionData'] = await subscriptionDataQuery.getOne();
    return {
      access_token: this.jwtService.sign(
        { userId: userExists.id },
        {
          secret: process.env.JWT_SECRET_KEY,
          expiresIn: userData.remember_me ? '60d' : '2d', // Set the expiration time here
        },
      ),
      userData: userExists,
      message: 'Login Successful',
    };
  }

  async forgotPassword(userData: ForgotPasswordDto) {
    const userExists: Users = await this.userRepository.findOne({
      where: {
        email: userData.email,
      },
    });

    if (!userExists) {
      throw new HttpException(
        {
          code: 'conflict',
          description: 'No User Found!',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (userExists.status != 1) {
      throw new HttpException(
        {
          code: 'conflict',
          description: 'Your account is inactive or not verified!',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const resetToken = await bcrypt.hash(
      userExists.first_name + process.env.JWT_SCERET_KEY,
      12,
    );

    await this.userRepository.update(userExists.id, {
      reset_token: resetToken,
    });

    const jwtResetToken = this.jwtService.sign(
      {
        email: userExists.email,
        resetToken,
      },
      {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: '30m', // Set the expiration time here
      },
    );

    const generalConfigData =
      await this.generalConfigService.getGeneralConfigurationFunc();

    const htmlData = await this.emailService.renderTemplate(
      './views/email/forgotPassword.hbs',
      {
        subject: 'reset password', // pass the required parameters on the hbs
        resetUrl: `${process.env.FRONTEND_URL}/account/set-password?email=${userExists.email}&&resetToken=${jwtResetToken}`,
        logo: generalConfigData.site_logo,
        mailTo: process.env.SUPPORT_EMAIL,
      },
    );

    await this.emailService.sendMail(
      userExists.email,
      'Reset Password',
      '',
      htmlData,
    );
    return { message: 'Reset Password Email Sent Successfully' };
  }

  async resetPassword(userData: ResetPasswordDto, res: any) {
    try {
      let jwtVerified: any;
      try {
        jwtVerified = this.jwtService.verify(userData.resetToken, {
          secret: process.env.JWT_SECRET_KEY,
        });
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new HttpException(
            {
              code: 'token_expired',
              description: 'Token has expired',
            },
            HttpStatus.UNAUTHORIZED,
          );
        } else if (error.name === 'JsonWebTokenError') {
          throw new HttpException(
            {
              code: 'token_invalid',
              description: 'Invalid token',
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      const userExists: Users = await this.userRepository.findOne({
        where: {
          email: jwtVerified.email,
        },
      });

      if (!userExists) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'No User Found!',
          },
          HttpStatus.CONFLICT,
        );
      }

      if (userExists.status != 1) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'Your account is inactive or not verified!',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (
        !userExists.reset_token ||
        userExists.reset_token !== jwtVerified.resetToken
      ) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'Wrong reset token please generate new reset link',
          },
          HttpStatus.CONFLICT,
        );
      }

      const newPassword = await bcrypt.hash(userData.newPassword, 12);

      await this.userRepository.update(userExists.id, {
        reset_token: null,
        password: newPassword,
      });

      const responseData = { message: 'Password reset successfully' };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN USER RESET PASSWORD : ', error);
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

  async acceptInvitaion(userData: AcceptInviationDto, res: any) {
    try {
      let jwtVerified: any;
      try {
        jwtVerified = this.jwtService.verify(userData.invitationToken, {
          secret: process.env.JWT_SECRET_KEY,
        });
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new HttpException(
            {
              code: 'token_expired',
              description: 'Token has expired',
            },
            HttpStatus.UNAUTHORIZED,
          );
        } else if (error.name === 'JsonWebTokenError') {
          throw new HttpException(
            {
              code: 'token_invalid',
              description: 'Invalid token',
            },
            HttpStatus.UNAUTHORIZED,
          );
        }
      }

      const userExists: Users = await this.userRepository.findOne({
        where: {
          email: jwtVerified.email,
        },
      });

      if (!userExists) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'No User Found!',
          },
          HttpStatus.CONFLICT,
        );
      }

      if (userExists.status !== 2) {
        throw new HttpException(
          {
            code: 'conflict',
            description:
              'Already accepted invitation please login to continue!',
          },
          HttpStatus.CONFLICT,
        );
      }

      if (
        !userExists.invitation_token ||
        userExists.invitation_token !== jwtVerified.invitationToken
      ) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'Invitation link has been expired!',
          },
          HttpStatus.CONFLICT,
        );
      }

      const newPassword = await bcrypt.hash(userData.password, 12);

      await this.userRepository.update(userExists.id, {
        status: 1,
        password: newPassword,
        invitation_token: null,
      });

      const userUpdated: Users = await this.userRepository.findOne({
        where: {
          email: jwtVerified.email,
        },
      });

      delete userUpdated['password'];
      const responseData = {
        message: 'Invitation accepted successfully!',
        access_token: this.jwtService.sign(
          { userId: userExists.id },
          {
            secret: process.env.JWT_SECRET_KEY,
            expiresIn: '48h', // Set the expiration time here
          },
        ),
        userData: userUpdated,
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN USER INVITATION ACCEPT : ', error);
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
