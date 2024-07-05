import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { RedisModule } from 'src/redis/redis.module';
import { GeneralConfigurationService } from 'src/admin/configuration/generalconfiguration/general_configuration.service';
import { HelperService } from 'src/helper.service';
import { AwsModule } from 'src/aws/aws.module';

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
    RedisModule,
    AwsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    RedisService,
    GeneralConfigurationService,
    HelperService,
  ],
})
export class FrontEndAuthModule {}
