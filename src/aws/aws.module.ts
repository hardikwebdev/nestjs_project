import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { ConfigService } from '@nestjs/config';
import { HelperService } from 'src/helper.service';

@Module({
  providers: [ConfigService, AwsService, HelperService],
  exports: [AwsService],
})
export class AwsModule {}
