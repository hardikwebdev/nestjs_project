import { Module, MiddlewareConsumer } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { EmailService } from 'src/email/email.service';
import { LogsMiddleware } from '../middleware/logs.middleware';
import { AwsService } from 'src/aws/aws.service';
import { AwsModule } from 'src/aws/aws.module';
import { HelperService } from 'src/helper.service';
import { JwtStrategy } from '../category/jwt.strategy';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { GeneralConfigurationService } from '../configuration/generalconfiguration/general_configuration.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret:
          process.env.JWT_SCERET_KEY ||
          '5JLMIBTPGCFlVYX0NWBIfxauocnstuBH1PwhZA46DOkNDJe37wTtFOnGhmaNrk6C',
        signOptions: {
          expiresIn: '60s',
        },
      }),
    }),
    DatabaseModule,
    AwsModule,
  ],
  controllers: [UsersController],
  providers: [
    JwtStrategy,
    EmailService,
    AwsService,
    HelperService,
    UsersService,
    GeneralConfigurationService,
  ],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes(UsersController);
  }
}
