import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/createUser.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Users } from 'src/database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { HelperService } from 'src/helper.service';
import { AwsService } from 'src/aws/aws.service';
import { DeleteUserDto } from './dto/deleteUser.dto';
import { ForgotPasswordDto } from '../auth/dto/forgotpassword.dto';
import { GeneralConfigurationService } from '../configuration/generalconfiguration/general_configuration.service';
import { SubscribedUsers } from 'src/database/entities/subscribed_users.entity';
import { TransactionHistory } from 'src/database/entities/transaction_history.entity';
import { BlogPosts } from 'src/database/entities/blog_posts.entity';
import { Tags } from 'src/database/entities/tags.entity';
import { BlogsTags } from 'src/database/entities/blogs_tag.entity';
import { BlogsComments } from 'src/database/entities/blogs_comments.entity';
import { SavedBlogs } from 'src/database/entities/saved_blogs.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<Users>,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
    private helperService: HelperService,
    private awsService: AwsService,
    private readonly generalConfigService: GeneralConfigurationService,
    @Inject('SUBSCRIBED_USERS_REPOSITORY')
    private subscribedUsersRepository: Repository<SubscribedUsers>,
    @Inject('TRANSACTION_HISTORY_REPOSITORY')
    private transactionHistoryRepository: Repository<TransactionHistory>,
    @Inject('BLOG_POSTS_REPOSITORY')
    private blogPostRepository: Repository<BlogPosts>,
    @Inject('TAGS_REPOSITORY')
    private tagsRepository: Repository<Tags>,
    @Inject('BLOGSTAGS_REPOSITORY')
    private blogsTagsRepository: Repository<BlogsTags>,
    @Inject('BLOGS_COMMENT_REPOSITORY')
    private blogsCommentRepository: Repository<BlogsComments>,
    @Inject('SAVED_BLOGS_REPOSITORY')
    private savedBlogsRepository: Repository<SavedBlogs>,
  ) {}

  async getUsers(query: any, res: any) {
    const page =
      query.page && parseInt(query.page) == query.page
        ? parseInt(query.page)
        : 1;
    const pageSize =
      query.pageSize && parseInt(query.pageSize) == query.pageSize
        ? parseInt(query.pageSize)
        : 10;
    const skip = (page - 1) * pageSize;

    const sortBy = query.sortBy ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder ? query.sortOrder : 'DESC';

    const queryBuilder: SelectQueryBuilder<Users> = this.userRepository
      .createQueryBuilder('users')
      .skip(skip)
      .take(pageSize)
      .orderBy(`users.${sortBy}`, sortOrder)
      .where('(users.role != 0 AND users.role != 0)');

    if (query.search) {
      queryBuilder.andWhere(
        '(users.first_name LIKE :search OR users.last_name LIKE :search OR users.email LIKE :search)',
        {
          search: `%${query.search}%`,
        },
      );
    }

    if (query.status) {
      queryBuilder.andWhere('(users.status = :status)', {
        status: query.status,
      });
    }

    // Need to append the users subscription and other related data
    const [usersData, total] = await queryBuilder.getManyAndCount();

    for (let i = 0; i < usersData.length; i++) {
      const subscriptionDataQuery: SelectQueryBuilder<SubscribedUsers> =
        this.subscribedUsersRepository
          .createQueryBuilder('subscribed_users')
          .leftJoin('subscribed_users.subscription_plan', 'subscription_plan')
          .addSelect(['subscription_plan.id', 'subscription_plan.package_name'])
          .orderBy(`subscribed_users.id`, 'DESC')
          .where('(subscribed_users.user_id = :user_id)', {
            user_id: usersData[i].id,
          })
          .andWhere('(subscribed_users.cron_check = :cron_check)', {
            cron_check: 0,
          });

      usersData[i]['subscriptionData'] = await subscriptionDataQuery.getOne();
    }

    res.locals.responseBody = usersData;
    res.send({ usersData, total });
  }

  async createUser(userData: CreateUserDto, res: any) {
    try {
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

      if (this.helperService.isBase64(userData.profile_url)) {
        const uploadedImage = await this.awsService.uploadToAWS(
          'profile_url',
          userData.profile_url,
          'USER_PROFILE',
        );

        userData.profile_url = uploadedImage.Location;
      }

      const createdUserData = await this.userRepository.insert(userData);

      const invitationToken = await bcrypt.hash(
        userData.email + process.env.JWT_SCERET_KEY,
        12,
      );

      await this.userRepository.update(
        {
          id: createdUserData.generatedMaps[0].id,
        },
        {
          invitation_token: invitationToken,
          status: 2,
        },
      );

      const jwtInvitationToken = this.jwtService.sign(
        {
          email: userData.email,
          invitationToken,
        },
        {
          secret: process.env.JWT_SECRET_KEY,
          expiresIn: '24h', // Set the expiration time here
        },
      );

      const generalConfigData =
        await this.generalConfigService.getGeneralConfigurationFunc();

      const htmlData = await this.emailService.renderTemplate(
        './views/email/inviteUser.hbs',
        {
          subject: 'invite user', // pass the required parameters on the hbs
          invitationUrl: `${process.env.FRONTEND_URL}/account/set-password?email=${userData.email}&&invitationToken=${jwtInvitationToken}`,
          logo: generalConfigData.site_logo,
          mailTo: process.env.SUPPORT_EMAIL,
        },
      );

      await this.emailService.sendMail(
        userData.email,
        'Invite User',
        '',
        htmlData,
      );

      const responseData = {
        message: 'User added successfully',
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN CREATE USER : ', error);
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

  async updateUser(userData: any, res: any) {
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

      if (existingUser.status === 2) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'User has not accepted the inviation!',
          },
          HttpStatus.CONFLICT,
        );
      }

      const allowedKeys: any = CreateUserDto.allowedKeys;
      userData = this.helperService.filterReqBody(allowedKeys, userData);

      if (this.helperService.isBase64(userData.profile_url)) {
        const uploadedImage = await this.awsService.uploadToAWS(
          'profile_url',
          userData.profile_url,
          'USER_PROFILE',
        );

        userData.profile_url = uploadedImage.Location;
        if (existingUser.profile_url) {
          await this.awsService.removeFromBucket(existingUser.profile_url);
        }
      }

      delete userData.email;
      await this.userRepository.update(
        {
          id: existingUser.id,
        },
        userData,
      );

      const responseData = {
        message: 'User updated successfully',
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN UPDATE USER : ', error);
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

  async deleteUser(userData: DeleteUserDto, res: any) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: {
          id: userData.id,
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

      if (existingUser.role === 0) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'Cannot delete admin user!',
          },
          HttpStatus.CONFLICT,
        );
      }

      await this.userRepository.update(
        {
          id: existingUser.id,
        },
        {
          deletedAt: new Date(),
        },
      );

      if (existingUser.profile_url) {
        await this.awsService.removeFromBucket(existingUser.profile_url);
      }

      const existingActiveSubscription =
        await this.subscribedUsersRepository.findOne({
          where: {
            user_id: existingUser.id,
            cron_check: 0,
          },
          order: {
            id: 'DESC',
          },
        });

      if (existingActiveSubscription) {
        const transaction_id = this.helperService.generateRandomString(15);
        const transactionHistoryData: any = {
          user_id: existingActiveSubscription.user_id,
          subscription_id: existingActiveSubscription.id,
          transaction_type: 'cancelled',
          transaction_id,
          start_date: existingActiveSubscription.start_date,
          end_date: existingActiveSubscription.end_date,
        };

        await this.transactionHistoryRepository.insert(transactionHistoryData);

        await this.subscribedUsersRepository.update(
          existingActiveSubscription.id,
          {
            cron_check: 2,
          },
        );
      }

      if (userData.delete_blogs) {
        const usersBlogs = await this.blogPostRepository.find({
          where: {
            user_id: existingUser.id,
          },
        });

        if (usersBlogs.length > 0) {
          for (let i = 0; i < usersBlogs.length; i++) {
            const currentBlog = usersBlogs[i];

            await this.blogPostRepository.update(currentBlog.id, {
              deletedAt: new Date(),
            });

            currentBlog.banner = this.helperService.isJson(currentBlog.banner)
              ? JSON.parse(currentBlog.banner)
              : [];

            if (currentBlog.banner.length > 0) {
              for (let i = 0; i < currentBlog.banner.length; i++) {
                await this.awsService.removeFromBucket(
                  currentBlog.banner[i]['Location'],
                );

                if (currentBlog.banner[i]['type'] === 'blog_video') {
                  if (currentBlog.banner[i]['video_thumbnail']) {
                    await this.awsService.removeFromBucket(
                      currentBlog.banner[i]['video_thumbnail']['Location'],
                    );
                  }
                }
              }
            }

            await this.blogsTagsRepository.update(
              {
                blog_id: currentBlog.id,
              },
              {
                deletedAt: new Date(),
              },
            );

            await this.blogsCommentRepository.update(
              {
                blog_id: currentBlog.id,
              },
              {
                deletedAt: new Date(),
              },
            );
          }
        }
      }

      await this.savedBlogsRepository.update(
        {
          user_id: existingUser.id,
        },
        {
          deletedAt: new Date(),
        },
      );

      // Need to delete the active subscritpion and also need to delete or update user related data
      const responseData = {
        message: 'User deleted successfully',
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN UPDATE USER : ', error);
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

  async resedInvitaionUser(userData: DeleteUserDto, res: any) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: {
          id: userData.id,
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

      if (existingUser.status !== 2) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'User has already accepted invitation!',
          },
          HttpStatus.CONFLICT,
        );
      }

      const invitationToken = await bcrypt.hash(
        existingUser.email + process.env.JWT_SCERET_KEY,
        12,
      );

      await this.userRepository.update(
        {
          id: existingUser.id,
        },
        {
          invitation_token: invitationToken,
        },
      );

      const jwtInvitationToken = this.jwtService.sign(
        {
          email: existingUser.email,
          invitationToken,
        },
        {
          secret: process.env.JWT_SECRET_KEY,
          expiresIn: '24h', // Set the expiration time here
        },
      );

      const generalConfigData =
        await this.generalConfigService.getGeneralConfigurationFunc();

      const htmlData = await this.emailService.renderTemplate(
        './views/email/inviteUser.hbs',
        {
          subject: 'invite user', // pass the required parameters on the hbs
          invitationUrl: `${process.env.FRONTEND_URL}/account/set-password?email=${existingUser.email}&&invitationToken=${jwtInvitationToken}`,
          logo: generalConfigData.site_logo,
          mailTo: process.env.SUPPORT_EMAIL,
        },
      );

      await this.emailService.sendMail(
        existingUser.email,
        'Invite User',
        '',
        htmlData,
      );

      const responseData = {
        message: 'Invitation resent successfully',
      };
      res.locals.responseBody = responseData;
      res.send(responseData);
    } catch (error) {
      console.log('ERROR IN RESEND INVITATION USER : ', error);
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

  async resetPassword(userData: ForgotPasswordDto) {
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

    if (userExists.role === 0) {
      throw new HttpException(
        {
          code: 'conflict',
          description: 'Cannot reset password this user role!',
        },
        HttpStatus.CONFLICT,
      );
    }

    if (userExists.status !== 1) {
      throw new HttpException(
        {
          code: 'conflict',
          description: 'User is not active!',
        },
        HttpStatus.CONFLICT,
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

  async getUserProfile(req: any, res: any) {
    try {
      if (!req.query.userId) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'User Id is required!',
          },
          HttpStatus.CONFLICT,
        );
      }

      const userData = await this.userRepository.findOne({
        where: {
          id: req.query.userId,
        },
      });

      if (!userData) {
        throw new HttpException(
          {
            code: 'conflict',
            description: 'User not found!',
          },
          HttpStatus.CONFLICT,
        );
      }

      const userProfileData = {
        ...userData,
      };

      const subscriptionDataQuery: SelectQueryBuilder<SubscribedUsers> =
        this.subscribedUsersRepository
          .createQueryBuilder('subscribed_users')
          .leftJoin('subscribed_users.subscription_plan', 'subscription_plan')
          .addSelect(['subscription_plan.id', 'subscription_plan.package_name'])
          .orderBy(`subscribed_users.id`, 'DESC')
          .where('(subscribed_users.user_id = :user_id)', {
            user_id: req.query.userId,
          })
          .andWhere('(subscribed_users.cron_check = :cron_check)', {
            cron_check: 0,
          });

      userProfileData['subscriptionData'] =
        await subscriptionDataQuery.getOne();

      res.locals.responseBody = userProfileData;
      res.send({ userProfileData });
    } catch (error) {
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
