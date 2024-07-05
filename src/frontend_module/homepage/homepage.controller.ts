import {
  Controller,
  Get,
  HttpCode,
  Res,
  Query,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { HomepageService } from './homepage.service';
import { BlogOrNewsDetailDto } from './dto/getBlogOrNewsDetail.dto';
import { JwtFrontAuthGuard } from './jwt-front-auth.gaurd';
import { BookmarkDto } from './dto/bookmark.dto';
import { SyncBookmarkDto } from './dto/syncBookmark.dto';
import { ChatsService } from '../chats/chats.service';
import { ChatsDto } from '../chats/dto/chats.dto';
import { CommonGetDto } from 'src/commonGet.dto';

@ApiCookieAuth()
@Controller('/v1/homepage')
export class HomepageController {
  constructor(
    private homepageService: HomepageService,
    private chatService: ChatsService,
  ) {}
  @Get('/')
  @HttpCode(200)
  getHomePageData(@Res() res: Response): any {
    return this.homepageService.getHomePageData(res);
  }

  @Get('/generalconfiguration')
  getGeneralConfiguration(@Res() res: Response): any {
    return this.homepageService.getGeneralConfiguration(res);
  }

  @Get('/getBlogOrNewsDeatils')
  getBlogOrNewsDeatils(
    @Query() query: BlogOrNewsDetailDto,
    @Res() res: Response,
  ): any {
    return this.homepageService.getBlogOrNewsDeatils(query, res);
  }

  @UseGuards(JwtFrontAuthGuard)
  @Post('/bookmark')
  bookmark(@Body() body: BookmarkDto, @Res() res: Response): any {
    return this.homepageService.bookmark(body, res);
  }

  @UseGuards(JwtFrontAuthGuard)
  @Post('/syncBookmark')
  syncBookmark(@Body() body: SyncBookmarkDto, @Res() res: Response): any {
    return this.homepageService.syncBookmark(body, res);
  }

  @Post('/sendChat')
  sendChat(
    @Body() body: ChatsDto,
    @Req() req: Request,
    @Res() res: Response,
  ): any {
    return this.chatService.sendChat(req, body, res);
  }

  @Get('/getComments')
  getComments(@Query() query: CommonGetDto, @Res() res: Response): any {
    return this.homepageService.getComments(query, res);
  }

  @Get('/getTags')
  getTags(@Res() res: Response): any {
    return this.homepageService.getTags(res);
  }
}
