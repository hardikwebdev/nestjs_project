import { Injectable, HttpStatus, Inject, HttpException } from '@nestjs/common';
import { AboutUs } from 'src/database/entities/about_us.entity';
import { BlogPosts } from 'src/database/entities/blog_posts.entity';
import { Category } from 'src/database/entities/category.entity';
import { GeneralConfiguration } from 'src/database/entities/general_configuration.entity';
import { SlidersConfigurations } from 'src/database/entities/sliders_configurations.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BlogOrNewsDetailDto } from './dto/getBlogOrNewsDetail.dto';
import { BookmarkDto } from './dto/bookmark.dto';
import { SavedBlogs } from 'src/database/entities/saved_blogs.entity';
import { SyncBookmarkDto } from './dto/syncBookmark.dto';
import { HomeBlockConfigurations } from 'src/database/entities/home_block_configuration.entity';
import { AddCommentDto } from '../blogs_news/dto/addcomment.dto';
import { BlogsComments } from 'src/database/entities/blogs_comments.entity';
import { Tags } from 'src/database/entities/tags.entity';
import { Users } from 'src/database/entities/user.entity';

@Injectable()
export class HomepageService {
  constructor(
    @Inject('SLIDERS_CONFIGURATION_REPOSITORY')
    private sliderConfigurationRepository: Repository<SlidersConfigurations>,
    @Inject('BLOG_POSTS_REPOSITORY')
    private blogPostRepository: Repository<BlogPosts>,
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: Repository<Category>,
    @Inject('ABOUT_US_REPOSITORY')
    private aboutUsRepository: Repository<AboutUs>,
    @Inject('GENERAL_CONFIGURATION_REPOSITORY')
    private generalConfigurationRepository: Repository<GeneralConfiguration>,
    @Inject('SAVED_BLOGS_REPOSITORY')
    private savedBlogsRepository: Repository<SavedBlogs>,
    @Inject('HOME_BLOCK_CONFIGURATION_REPOSITORY')
    private homeBlockConfigurationRepository: Repository<HomeBlockConfigurations>,
    @Inject('BLOGS_COMMENT_REPOSITORY')
    private blogsCommentRepository: Repository<BlogsComments>,
    @Inject('TAGS_REPOSITORY')
    private tagsRepository: Repository<Tags>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<Users>,
  ) {}

  async getHomePageData(res: any) {
    try {
      const SliderQueryBuilder: SelectQueryBuilder<SlidersConfigurations> =
        this.sliderConfigurationRepository
          .createQueryBuilder('slider')
          .orderBy(`slider.id`, 'DESC')
          .where('slider.slider_type = :slider_type', {
            slider_type: 'home',
          })
          .andWhere('slider.status = :status', {
            status: 1,
          });

      const sliderData = await SliderQueryBuilder.getMany();

      const BlogQueryBuilder: SelectQueryBuilder<BlogPosts> =
        this.blogPostRepository
          .createQueryBuilder('blogposts')
          .leftJoinAndSelect('blogposts.category', 'category')
          .leftJoin('blogposts.blogstags', 'blogstags')
          .leftJoin('blogstags.tags', 'tags')
          .addSelect([
            'blogstags.id',
            'blogstags.tags',
            'blogstags.status',
            'tags.id',
            'tags.name',
          ])
          .take(5)
          .orderBy(`blogposts.id`, 'DESC')
          .andWhere('blogposts.post_type = :post_type', {
            post_type: 'blog',
          })
          .andWhere('blogposts.status = :status', {
            status: 1,
          });

      const blogPostData = await BlogQueryBuilder.getMany();

      for (let i = 0; i < blogPostData.length; i++) {
        const userData = await this.userRepository.findOne({
          where: {
            id: blogPostData[i].user_id,
          },
          withDeleted: true,
          select: ['id', 'first_name', 'last_name', 'email'],
        });

        blogPostData[i]['user'] = userData;
      }

      const NewsQueryBuilder: SelectQueryBuilder<BlogPosts> =
        this.blogPostRepository
          .createQueryBuilder('blogposts')
          .leftJoinAndSelect('blogposts.category', 'category')
          .leftJoin('blogposts.blogstags', 'blogstags')
          .leftJoin('blogstags.tags', 'tags')
          .addSelect([
            'blogstags.id',
            'blogstags.tags',
            'blogstags.status',
            'tags.id',
            'tags.name',
          ])
          .take(5)
          .orderBy(`blogposts.id`, 'DESC')
          .andWhere('blogposts.post_type = :post_type', {
            post_type: 'news',
          })
          .andWhere('blogposts.status = :status', {
            status: 1,
          });

      const newsData = await NewsQueryBuilder.getMany();

      for (let i = 0; i < newsData.length; i++) {
        const userData = await this.userRepository.findOne({
          where: {
            id: newsData[i].user_id,
          },
          withDeleted: true,
          select: ['id', 'first_name', 'last_name', 'email'],
        });

        newsData[i]['user'] = userData;
      }

      // Subquery to count how many blog posts are in each category
      const subqueryBlogCount = this.blogPostRepository
        .createQueryBuilder('blogPosts')
        .select('blogPosts.category_id', 'category_id') // Specify the column alias
        .addSelect('COUNT(*)', 'count')
        .groupBy('blogPosts.category_id');

      // Subquery to count how many saved blog posts are in each category
      const subquerySavedBlogCount = this.savedBlogsRepository
        .createQueryBuilder('savedBlogs')
        .select('blogPosts.category_id', 'category_id') // Specify the column alias
        .addSelect('COUNT(*)', 'count')
        .innerJoin('savedBlogs.blogposts', 'blogPosts')
        .groupBy('blogPosts.category_id');

      // Main query to select the top 3 categories based on the sum of blog and saved blog counts
      const categoryData = await this.categoryRepository
        .createQueryBuilder('category')
        .select([
          'category.id',
          'category.title',
          'category.slug',
          'category.status',
          'category.image_url',
        ])
        .addSelect(
          'COALESCE(blogCount.count, 0) + COALESCE(savedBlogCount.count, 0)',
          'total_count',
        )
        .leftJoin(
          `(${subqueryBlogCount.getQuery()})`,
          'blogCount',
          'category.id = blogCount.category_id',
        )
        .leftJoin(
          `(${subquerySavedBlogCount.getQuery()})`,
          'savedBlogCount',
          'category.id = savedBlogCount.category_id',
        )
        .orderBy('total_count', 'DESC')
        .limit(3)
        .where('(category.status = :status)', {
          status: 1,
        })
        .getRawMany();

      const homeBlockConfiguration = await this.homeBlockConfigurationRepository
        .createQueryBuilder('homeblockconfig')
        .where('(homeblockconfig.status = :status)', {
          status: 1,
        })
        .andWhere('(homeblockconfig.block_type = :block_type)', {
          block_type: 'block',
        })
        .getOne();

      const chatBlockConfiguration = await this.homeBlockConfigurationRepository
        .createQueryBuilder('homeblockconfig')
        .where('(homeblockconfig.status = :status)', {
          status: 1,
        })
        .andWhere('(homeblockconfig.block_type = :block_type)', {
          block_type: 'chatblock',
        })
        .getOne();

      const responseData = {
        message: 'Home data fetched successfully!',
        sliderData,
        blogPostData,
        newsData,
        categoryData,
        homeBlockConfiguration,
        chatBlockConfiguration,
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN HOMEPAGE : ', error);
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

  async getGeneralConfiguration(res: any) {
    const existingGeneralConfiguration =
      await this.generalConfigurationRepository.findOne({
        where: {},
      });

    res.locals.responseBody = existingGeneralConfiguration;
    res.send(existingGeneralConfiguration);
  }

  async getBlogOrNewsDeatils(query: BlogOrNewsDetailDto, res: any) {
    try {
      const queryBuilder: SelectQueryBuilder<BlogPosts> =
        this.blogPostRepository
          .createQueryBuilder('blogposts')
          .leftJoinAndSelect('blogposts.category', 'category')
          .leftJoin('blogposts.blogstags', 'blogstags')
          .leftJoin('blogstags.tags', 'tags')
          .addSelect([
            'blogstags.id',
            'blogstags.tags',
            'blogstags.status',
            'tags.id',
            'tags.name',
          ])
          .andWhere('blogposts.id = :id', {
            id: query.id,
          });

      const blogOrNewDetails = await queryBuilder.getOne();

      if (!blogOrNewDetails) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'Data not found!',
          },
          HttpStatus.CONFLICT,
        );
      }

      const userData = await this.userRepository.findOne({
        where: {
          id: blogOrNewDetails.user_id,
        },
        withDeleted: true,
        select: ['id', 'first_name', 'last_name', 'email'],
      });
      blogOrNewDetails['user'] = userData;

      res.locals.responseBody = blogOrNewDetails;
      res.send({ blogOrNewDetails });
    } catch (error) {
      console.log('ERROR IN getBlogOrNewsDeatils : ', error);
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

  async bookmarkFunc(bookmarkData: BookmarkDto) {
    try {
      const blogData = await this.blogPostRepository.findOne({
        where: {
          id: bookmarkData.blog_id,
        },
      });

      if (!blogData) {
        throw new HttpException(
          {
            code: 'conflict',
            description: `Blog not found!`,
          },
          HttpStatus.CONFLICT,
        );
      }

      const existingBookmark = await this.savedBlogsRepository.findOne({
        where: {
          user_id: bookmarkData.user_id,
          blog_id: bookmarkData.blog_id,
        },
      });

      if (existingBookmark) {
        await this.savedBlogsRepository.update(
          {
            id: existingBookmark.id,
          },
          {
            bookmarked: bookmarkData.bookmarked,
          },
        );
      } else {
        await this.savedBlogsRepository.insert({
          blog_id: bookmarkData.blog_id,
          user_id: bookmarkData.user_id,
          bookmarked: bookmarkData.bookmarked,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async bookmark(bookmarkData: BookmarkDto, res: any) {
    try {
      await this.bookmarkFunc(bookmarkData);

      const responseData = {
        message: `${
          bookmarkData.bookmarked ? 'Bookmarked' : 'Removed from bookmark'
        } successfully`,
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN BOOKMARK : ', error);
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

  async syncBookmark(bookmarkData: SyncBookmarkDto, res: any) {
    try {
      let successCount = 0;
      for (let i = 0; i < bookmarkData.bookmarkData.length; i++) {
        try {
          await this.bookmarkFunc(bookmarkData.bookmarkData[i]);
          successCount++;
        } catch (error) {}
      }

      if (successCount === 0) {
        throw new HttpException(
          {
            code: 'conflict',
            description: `Failed to sync the bookmark!`,
          },
          HttpStatus.CONFLICT,
        );
      }

      const responseData = {
        message: 'Bookmark synced successfully!',
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN BOOKMARK : ', error);
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

  async getComments(query: any, res: any) {
    try {
      const page =
        query.page && parseInt(query.page) == query.page
          ? parseInt(query.page)
          : 1;
      const pageSize =
        query.pageSize && parseInt(query.pageSize) == query.pageSize
          ? parseInt(query.pageSize)
          : 5;
      const skip = (page - 1) * pageSize;

      const sortBy = query.sortBy
        ? AddCommentDto.sortAbleKeys.includes(query.sortBy)
          ? query.sortBy
          : 'createdAt'
        : 'createdAt';
      const sortOrder = query.sortOrder ? query.sortOrder : 'DESC';

      const queryBuilder: SelectQueryBuilder<BlogsComments> =
        this.blogsCommentRepository
          .createQueryBuilder('blogscomment')
          .withDeleted()
          .leftJoin('blogscomment.user', 'user')
          .addSelect([
            'user.id',
            'user.first_name',
            'user.last_name',
            'user.email',
            'user.profile_url',
          ])
          .skip(skip)
          .take(pageSize)
          .orderBy(`blogscomment.${sortBy}`, sortOrder)
          .where('blogscomment.deletedAt is NULL');

      if ([0, 1].includes(parseInt(query.status))) {
        queryBuilder.andWhere('blogscomment.status = :status', {
          status: parseInt(query.status),
        });
      }

      if (query.blog_id) {
        queryBuilder.andWhere('blogscomment.blog_id = :blog_id', {
          blog_id: query.blog_id,
        });
      }

      const [blogsCommentData, total] = await queryBuilder.getManyAndCount();

      res.locals.responseBody = { blogsCommentData, total };
      res.send({ blogsCommentData, total });
    } catch (error) {
      console.log('ERROR IN GET COMMENTS : ', error);
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

  async getTags(res: any) {
    try {
      const tagsData = await this.tagsRepository.find();

      res.locals.responseBody = { tagsData };
      res.send({ tagsData });
    } catch (error) {
      console.log('ERROR IN GET Tags : ', error);
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
