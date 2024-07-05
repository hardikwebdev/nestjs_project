import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { BlogsNewsService } from './blogs_news.service';
import { BlogsController } from './blogs.controller';
import { NewsController } from './news.controller';
import { HelperService } from 'src/helper.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BlogsController, NewsController],
  providers: [BlogsNewsService, HelperService],
})
export class BlogsNewsModule {}
