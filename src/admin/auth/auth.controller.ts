import { Body, Controller, Post, HttpCode, Req } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotpassword.dto';
import { ResetPasswordDto } from './dto/resetpassword.dto';
import { ResendOtpDto } from './dto/resendotp.dto';
import { VerifyLoginDto } from './dto/verifylogin.dto';

@ApiCookieAuth()
@Controller('/admin/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() body: LoginDto, @Req() req: Request): any {
    return this.authService.login(body, req);
  }

  @Post('/forgotPassword')
  @HttpCode(200)
  forgotPassword(@Body() body: ForgotPasswordDto): any {
    return this.authService.forgotPassword(body);
  }

  @Post('/resetPassword')
  @HttpCode(200)
  resetPassword(@Body() body: ResetPasswordDto): any {
    return this.authService.resetPassword(body);
  }

  @Post('/resendOtp')
  @HttpCode(200)
  resendOtp(@Body() body: ResendOtpDto): any {
    return this.authService.resendOtp(body);
  }

  @Post('/verifyLogin')
  @HttpCode(200)
  verifyLogin(@Body() body: VerifyLoginDto): any {
    return this.authService.verifyLogin(body);
  }
}
