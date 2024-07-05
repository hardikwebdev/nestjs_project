import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Users } from 'src/database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { LoginHistory } from 'src/database/entities/login_history.entity';
import { RedisService } from 'src/redis/redis.service';
import { ResetPasswordDto } from './dto/resetpassword.dto';
import { ForgotPasswordDto } from './dto/forgotpassword.dto';
import { LoginDto } from './dto/login.dto';
import { ResendOtpDto } from './dto/resendotp.dto';
import { VerifyLoginDto } from './dto/verifylogin.dto';
import { GeneralConfigurationService } from '../configuration/generalconfiguration/general_configuration.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<Users>,
    @Inject('LOGIN_HISTORY_REPOSITORY')
    private loginHistoryRepository: Repository<LoginHistory>,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
    private readonly generalConfigService: GeneralConfigurationService,
  ) {}

  generateOTP(length: number) {
    const characters = '0123456789';
    const OTP = [];
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      OTP.push(characters.charAt(randomIndex));
    }

    return OTP.join('');
  }

  async setOtpRedis(key: string, value: any) {
    key = key.toLowerCase();
    let alreadyExist: any = await this.redisService.getValue(key);
    if (alreadyExist) {
      alreadyExist = JSON.parse(alreadyExist);
      const curTime: any = new Date();
      const createdAt: any = new Date(alreadyExist.createdAt);
      const timeDiff: any = (curTime - createdAt) / 1000;

      if (timeDiff > 30 && alreadyExist.otpCount < 3) {
        value.otpCount = alreadyExist.otpCount + 1;
        await this.redisService.setValue(key, JSON.stringify(value), 1800);
      } else if (timeDiff < 30 && alreadyExist.otpCount < 3) {
        const seconds: string = (30 - timeDiff).toString();
        throw new HttpException(
          {
            code: 'conflict',
            description: `Please wait for ${parseInt(seconds)} seconds`,
          },
          HttpStatus.CONFLICT,
        );
      } else if (alreadyExist.otpCount >= 3 && timeDiff > 1800) {
        value.otpCount = 1;
        await this.redisService.setValue(key, JSON.stringify(value), 1800);
      } else if (alreadyExist.otpCount >= 3 && timeDiff < 1800) {
        const seconds: string =
          1800 - timeDiff <= 60
            ? `${parseInt((1800 - timeDiff).toString())} seconds`
            : `${parseInt(((1800 - timeDiff) / 60).toString())} minutes`;
        throw new HttpException(
          {
            code: 'conflict',
            description: `You have exceed to resend otp limit please try again after ${seconds}`,
          },
          HttpStatus.CONFLICT,
        );
      } else {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'Failed to send otp try again!',
          },
          HttpStatus.CONFLICT,
        );
      }
    } else {
      value.otpCount = 1;
      await this.redisService.setValue(key, JSON.stringify(value), 1800);
    }
  }

  async login(userData: LoginDto, req: Request) {
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

    if (![0, 1].includes(userExists.role)) {
      throw new HttpException(
        {
          code: 'unauthorized',
          description: 'Unauthorised User!',
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

    if (userExists.role === 1) {
      const randomOtp = this.generateOTP(6);
      const userData = {
        userId: userExists.id,
        userEmail: userExists.email,
        otp: randomOtp,
        otpCount: 0,
        createdAt: new Date(),
      };

      await this.setOtpRedis(userExists.email, userData);

      const generalConfigData =
        await this.generalConfigService.getGeneralConfigurationFunc();

      const htmlData = await this.emailService.renderTemplate(
        './views/email/otpVerification.hbs',
        {
          subject: 'Otp verification', // pass the required parameters on the hbs
          randomOtp,
          logo: generalConfigData.site_logo,
          mailTo: process.env.SUPPORT_EMAIL,
        },
      );

      await this.emailService.sendMail(
        userExists.email,
        'Login Verification',
        '',
        htmlData,
      );

      return {
        message:
          'A mail has been sent to you for otp verification, please check',
        isTestUserLogin: true,
      };
    }

    const userAgentDetails = req.headers['user-agent'];
    await this.loginHistoryRepository.insert({
      user_id: userExists.id,
      user_agent: userAgentDetails ? JSON.stringify(userAgentDetails) : null,
    });

    delete userExists.password;
    return {
      access_token: this.jwtService.sign(
        { userId: userExists.id },
        {
          secret: process.env.JWT_SECRET_KEY,
          expiresIn: '48h', // Set the expiration time here
        },
      ),
      userData: userExists,
      isTestUserLogin: false,
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

    if (userExists.role !== 0) {
      throw new HttpException(
        {
          code: 'unauthorized',
          description: 'Unauthorised User!',
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
        resetUrl: `${process.env.FRONTEND_URL}/admin/reset-password?email=${userExists.email}&&resetToken=${jwtResetToken}`,
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

  async resetPassword(userData: ResetPasswordDto) {
    try {
      const jwtVerified = this.jwtService.verify(userData.resetToken, {
        secret: process.env.JWT_SECRET_KEY,
      });

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

      if (userExists.role !== 0) {
        throw new HttpException(
          {
            code: 'unauthorized',
            description: 'Unauthorised User!',
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

      return { message: 'Password reset successfully' };
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
      } else {
        // Handle other errors
        throw new HttpException(
          {
            code: 'internal_server_error',
            description: 'Internal server error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async resendOtp(userData: ResendOtpDto) {
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

    if (userExists.role !== 1) {
      throw new HttpException(
        {
          code: 'unauthorized',
          description: 'Unauthorised User!',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const randomOtp = this.generateOTP(6);
    const userDataObj = {
      userId: userExists.id,
      userEmail: userExists.email,
      otp: randomOtp,
      otpCount: 0,
      createdAt: new Date(),
    };

    await this.setOtpRedis(userExists.email, userDataObj);

    const generalConfigData =
      await this.generalConfigService.getGeneralConfigurationFunc();

    const htmlData = await this.emailService.renderTemplate(
      './views/email/otpVerification.hbs',
      {
        subject: 'Otp verification', // pass the required parameters on the hbs
        randomOtp,
        logo: generalConfigData.site_logo,
        mailTo: process.env.SUPPORT_EMAIL,
      },
    );

    await this.emailService.sendMail(
      userExists.email,
      'Login verification',
      '',
      htmlData,
    );

    return {
      message: 'A mail has been sent to you for otp verification, please check',
    };
  }

  async verifyLogin(userData: VerifyLoginDto) {
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

    if (userExists.role !== 1) {
      throw new HttpException(
        {
          code: 'unauthorized',
          description: 'Unauthorised User!',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userRedisData = await this.redisService.getValue(
      userData.email.toLowerCase(),
    );
    if (!userRedisData) {
      throw new HttpException(
        {
          code: 'conflict',
          description: 'Otp expired!',
        },
        HttpStatus.CONFLICT,
      );
    }

    const parsedData = JSON.parse(userRedisData);

    if (parseInt(parsedData.otp) !== parseInt(userData.otp)) {
      throw new HttpException(
        {
          code: 'unauthorized',
          description: 'Invalid Otp!',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    delete userExists.password;
    return {
      access_token: this.jwtService.sign(
        { userId: userExists.id },
        {
          secret: process.env.JWT_SECRET_KEY,
          expiresIn: '48h', // Set the expiration time here
        },
      ),
      userData: userExists,
      message: 'Otp verified successfully',
    };
  }
}
