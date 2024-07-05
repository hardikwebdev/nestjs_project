import {
  Controller,
  Get,
  HttpCode,
  Query,
  Res,
  Req,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { CommonGetDto } from 'src/commonGet.dto';
import { BlogsNewsService } from './blogs_news.service';
import { JwtFrontAuthGuard } from '../homepage/jwt-front-auth.gaurd';
import { AddCommentDto } from './dto/addcomment.dto';

@ApiCookieAuth()
@Controller('/v1/blogs')
export class BlogsController {
  constructor(private blogsNewsService: BlogsNewsService) {}

  @Get('/')
  @HttpCode(200)
  getBlogs(@Query() query: CommonGetDto, @Res() res: Response): any {
    return this.blogsNewsService.getBlogsOrNews(query, res);
  }

  @UseGuards(JwtFrontAuthGuard)
  @Get('/getSavedBlogs')
  @HttpCode(200)
  getSavedBlogs(
    @Req() req: Request,
    @Query() query: CommonGetDto,
    @Res() res: Response,
  ): any {
    return this.blogsNewsService.getSavedBlogsOrNews(req, query, res);
  }

  @UseGuards(JwtFrontAuthGuard)
  @Get('/getSavedBlogsAndNews')
  @HttpCode(200)
  getSavedBlogsAndNews(
    @Req() req: Request,
    @Query() query: CommonGetDto,
    @Res() res: Response,
  ): any {
    return this.blogsNewsService.getSavedBlogsOrNews(req, query, res);
  }

  @UseGuards(JwtFrontAuthGuard)
  @Post('/addComment')
  @HttpCode(200)
  addComment(
    @Req() req: Request,
    @Body() body: AddCommentDto,
    @Res() res: Response,
  ): any {
    return this.blogsNewsService.addComment(req, body, res);
  }

  @Get('/getAllCategory')
  @HttpCode(200)
  getAllCategory(@Res() res: Response): any {
    return this.blogsNewsService.getAllCategory(res);
  }
}
