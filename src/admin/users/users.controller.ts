import {
  Controller,
  UseGuards,
  Post,
  HttpCode,
  Body,
  Res,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../category/jwt-auth.guard';
import { CreateUserDto } from './dto/createUser.dto';
import { UsersService } from './users.service';
import { DeleteUserDto } from './dto/deleteUser.dto';
import { ForgotPasswordDto } from '../auth/dto/forgotpassword.dto';
import { CommonGetDto } from 'src/commonGet.dto';

@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('/admin/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/')
  @HttpCode(200)
  getUsers(@Query() query: CommonGetDto, @Res() res: Response): any {
    return this.usersService.getUsers(query, res);
  }

  @Post('/create')
  @HttpCode(200)
  createUser(@Body() body: CreateUserDto, @Res() res: Response): any {
    return this.usersService.createUser(body, res);
  }

  @Post('/update')
  @HttpCode(200)
  updateUser(@Body() body: CreateUserDto, @Res() res: Response): any {
    return this.usersService.updateUser(body, res);
  }

  @Post('/delete')
  @HttpCode(200)
  deleteUser(@Body() body: DeleteUserDto, @Res() res: Response): any {
    return this.usersService.deleteUser(body, res);
  }

  @Post('/resendInvitation')
  @HttpCode(200)
  resedInvitaionUser(@Body() body: DeleteUserDto, @Res() res: Response): any {
    return this.usersService.resedInvitaionUser(body, res);
  }

  @Post('/resetPassword')
  @HttpCode(200)
  resetPassword(@Body() body: ForgotPasswordDto): any {
    return this.usersService.resetPassword(body);
  }

  @Get('/getUserProfile')
  @HttpCode(200)
  getUserProfile(@Req() req: Request, @Res() res: Response): any {
    return this.usersService.getUserProfile(req, res);
  }
}
