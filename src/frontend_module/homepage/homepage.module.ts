import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';
import { JwtFrontStrategy } from './jwt-front.strategy';
import { ChatsService } from '../chats/chats.service';
import { EmailService } from 'src/email/email.service';
import { GeneralConfigurationService } from 'src/admin/configuration/generalconfiguration/general_configuration.service';
import { AwsService } from 'src/aws/aws.service';
import { AwsModule } from 'src/aws/aws.module';
import { HelperService } from 'src/helper.service';

@Module({
  imports: [DatabaseModule, AwsModule],
  controllers: [HomepageController],
  providers: [
    HomepageService,
    JwtFrontStrategy,
    ChatsService,
    EmailService,
    GeneralConfigurationService,
    AwsService,
    HelperService,
  ],
})
export class HomePageModule {}
