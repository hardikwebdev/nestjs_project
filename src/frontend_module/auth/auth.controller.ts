import { Body, Controller, Post, Res, HttpCode, Req } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { VerifyUserDto } from './dto/verifyUser.dto';
import { ForgotPasswordDto } from 'src/admin/auth/dto/forgotpassword.dto';
import { ResetPasswordDto } from 'src/admin/auth/dto/resetpassword.dto';
import { AcceptInviationDto } from './dto/acceptInvitation.dto';
import { LoginDto } from './dto/login.dto';

@ApiCookieAuth()
@Controller('/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signUp')
  signUp(@Body() body: SignUpDto, @Res() res: Response): any {
    return this.authService.signUp(body, res);
  }

  @Post('/resedVerificationEmail')
  @HttpCode(200)
  resedVerificationEmail(
    @Body() body: ForgotPasswordDto,
    @Res() res: Response,
  ): any {
    return this.authService.resedVerificationEmail(body, res);
  }

  @Post('/verifyUser')
  verifyUser(@Body() body: VerifyUserDto, @Res() res: Response): any {
    return this.authService.verifyUser(body, res);
  }

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
  resetPassword(@Body() body: ResetPasswordDto, @Res() res: Response): any {
    return this.authService.resetPassword(body, res);
  }

  @Post('/acceptInvitaion')
  acceptInvitaion(@Body() body: AcceptInviationDto, @Res() res: Response): any {
    return this.authService.acceptInvitaion(body, res);
  }
}
