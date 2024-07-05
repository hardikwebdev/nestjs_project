import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { UpdateBlogs } from 'src/admin/blogs/dto/updateblogs.dto';
import { BlogPosts } from 'src/database/entities/blog_posts.entity';
import { SavedBlogs } from 'src/database/entities/saved_blogs.entity';
import { HelperService } from 'src/helper.service';
import { SelectQueryBuilder, Repository } from 'typeorm';
import { BookmarkDto } from '../homepage/dto/bookmark.dto';
import * as _ from 'lodash';
import { AddCommentDto } from './dto/addcomment.dto';
import { BlogsComments } from 'src/database/entities/blogs_comments.entity';
import { SlidersConfigurations } from 'src/database/entities/sliders_configurations.entity';
import { Category } from 'src/database/entities/category.entity';
import { Users } from 'src/database/entities/user.entity';

@Injectable()
export class BlogsNewsService {
  constructor(
    @Inject('BLOG_POSTS_REPOSITORY')
    private blogPostRepository: Repository<BlogPosts>,
    @Inject('SAVED_BLOGS_REPOSITORY')
    private savedBlogsRepository: Repository<SavedBlogs>,
    @Inject('BLOGS_COMMENT_REPOSITORY')
    private blogsCommentRepository: Repository<BlogsComments>,
    private helperService: HelperService,
    @Inject('SLIDERS_CONFIGURATION_REPOSITORY')
    private sliderConfigurationRepository: Repository<SlidersConfigurations>,
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: Repository<Category>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<Users>,
  ) {}

  async getBlogsOrNews(query: any, res: any) {
    const page =
      query.page && parseInt(query.page) == query.page
        ? parseInt(query.page)
        : 1;
    const pageSize =
      query.pageSize && parseInt(query.pageSize) == query.pageSize
        ? parseInt(query.pageSize)
        : 10;
    const skip = (page - 1) * pageSize;

    const sortBy = query.sortBy
      ? UpdateBlogs.sortAbleKeys.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt'
      : 'createdAt';
    const sortOrder = query.sortOrder ? query.sortOrder : 'DESC';

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const queryBuilder: SelectQueryBuilder<BlogPosts> = this.blogPostRepository
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
      .skip(skip)
      .take(pageSize)
      .orderBy(`blogposts.${sortBy}`, sortOrder)
      .andWhere('DATE(blogposts.publish_date) <= :today', {
        today: formattedDate,
      })
      .andWhere('blogposts.status = :status', {
        status: 1,
      });

    if (query.excludeId) {
      queryBuilder.andWhere('blogposts.id != :excludeId', {
        excludeId: query.excludeId,
      });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(blogposts.title LIKE :search OR blogposts.short_description LIKE :search OR blogposts.long_description LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const sliderWhere = {
      status: 1,
    };

    if (['blog', 'news'].includes(query.post_type)) {
      queryBuilder.andWhere('blogposts.post_type = :post_type', {
        post_type: query.post_type,
      });

      sliderWhere['slider_type'] = query.post_type;
    }

    if (query.category_id) {
      queryBuilder.andWhere('blogposts.category_id = :category_id', {
        category_id: query.category_id,
      });
    }

    if (query.tag_ids) {
      query.tag_ids = decodeURIComponent(query.tag_ids);
      query.tag_ids = this.helperService.isJson(query.tag_ids)
        ? JSON.parse(query.tag_ids)
        : query.tag_ids;
      if (Array.isArray(query.tag_ids) && query.tag_ids.length > 0) {
        queryBuilder.andWhere('blogstags.tag_id IN (:...tag_ids)', {
          tag_ids: query.tag_ids,
        });

        queryBuilder.andWhere('(blogstags.status = :blogtags_status)', {
          blogtags_status: 1,
        });
      }
    }

    const sliderData = await this.sliderConfigurationRepository.findOne({
      where: sliderWhere,
    });

    const [blogsData, total] = await queryBuilder.getManyAndCount();

    for (let i = 0; i < blogsData.length; i++) {
      const userData = await this.userRepository.findOne({
        where: {
          id: blogsData[i].user_id,
        },
        withDeleted: true,
        select: ['id', 'first_name', 'last_name', 'email'],
      });

      blogsData[i]['user'] = userData;
    }

    res.locals.responseBody = blogsData;
    res.send({ blogsData, total, sliderData });
  }

  async getSavedBlogsOrNews(req: any, query: any, res: any) {
    try {
      const urlEndPoint = this.helperService.getUrlEndpoint(req.url);
      const post_type =
        urlEndPoint === 'getSavedBlogs'
          ? 'blog'
          : urlEndPoint === 'getSavedNews'
          ? 'news'
          : null;

      if (query.withPagination && query.withPagination == 'true') {
        const page =
          query.page && parseInt(query.page) == query.page
            ? parseInt(query.page)
            : 1;
        const pageSize =
          query.pageSize && parseInt(query.pageSize) == query.pageSize
            ? parseInt(query.pageSize)
            : 10;
        const skip = (page - 1) * pageSize;

        const sortBy = query.sortBy
          ? BookmarkDto.sortAbleKeys.includes(query.sortBy)
            ? query.sortBy
            : 'createdAt'
          : 'createdAt';
        const sortOrder = query.sortOrder ? query.sortOrder : 'DESC';

        const queryBuilder: SelectQueryBuilder<SavedBlogs> =
          this.savedBlogsRepository
            .createQueryBuilder('savedBlogs')
            .leftJoinAndSelect('savedBlogs.blogposts', 'blogposts')
            .leftJoin('blogposts.user', 'user')
            .addSelect([
              'user.id',
              'user.first_name',
              'user.last_name',
              'user.email',
            ])
            .skip(skip)
            .take(pageSize)
            .orderBy(`savedBlogs.${sortBy}`, sortOrder)
            .where('(savedBlogs.bookmarked = :bookmarked)', {
              bookmarked: 1,
            })
            .andWhere('savedBlogs.user_id = :user_id', {
              user_id: req.user.id,
            })
            .andWhere('blogposts.status = :status', {
              status: 1,
            });
        if (post_type) {
          queryBuilder.andWhere('blogposts.post_type = :post_type', {
            post_type,
          });
        }

        const [savedBlogsData, total] = await queryBuilder.getManyAndCount();

        res.locals.responseBody = { savedBlogsData, total };
        res.send({ savedBlogsData, total });
      } else {
        const queryBuilder: SelectQueryBuilder<SavedBlogs> =
          this.savedBlogsRepository
            .createQueryBuilder('savedBlogs')
            .leftJoinAndSelect('savedBlogs.blogposts', 'blogposts')
            .leftJoin('blogposts.user', 'user')
            .addSelect([
              'user.id',
              'user.first_name',
              'user.last_name',
              'user.email',
            ])
            .where('(savedBlogs.bookmarked = :bookmarked)', {
              bookmarked: 1,
            })
            .andWhere('savedBlogs.user_id = :user_id', {
              user_id: req.user.id,
            })
            .andWhere('blogposts.status = :status', {
              status: 1,
            });
        if (post_type) {
          queryBuilder.andWhere('blogposts.post_type = :post_type', {
            post_type,
          });
        }

        const savedBlogsData = await queryBuilder.getMany();

        const savedIdArray = _.map(savedBlogsData, 'blog_id');
        res.locals.responseBody = { savedBlogsData, savedIdArray };
        res.send({ savedBlogsData, savedIdArray });
      }
    } catch (error) {
      console.log('ERROR IN GET SAVED BLOGS OR NEWS : ', error);
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

  async addComment(req: any, commentData: AddCommentDto, res: any) {
    try {
      if (commentData.email !== req.user.email) {
        throw new HttpException(
          {
            code: 'unauthorized',
            description: 'You are not authorised to add this comment!',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const existingBlog = await this.blogPostRepository.findOne({
        where: {
          id: commentData.blog_id,
        },
      });

      if (!existingBlog) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'Blog or News not found!',
          },
          HttpStatus.CONFLICT,
        );
      }

      commentData['user_id'] = req.user.id;

      await this.blogsCommentRepository.insert(commentData);

      const responseData = {
        message: `Comment added successfully!`,
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN ADD COMMENT : ', error);
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

  async getAllCategory(res: any) {
    const categoryData = await this.categoryRepository.find({
      where: {
        status: 1,
      },
    });

    res.locals.responseBody = categoryData;
    res.send(categoryData);
  }
}
