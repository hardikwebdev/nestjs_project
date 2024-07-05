import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum subscriptionTypeEnum {
  VALUE1 = 'manual', // Done by Admin
  VALUE2 = 'auto', // Done with Payment Gateway
}

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: 'User Id',
    example: '1',
  })
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: 'User Id',
    example: '1',
  })
  plan_id: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: Date,
    description: 'Subscription start date',
    example: '10/09/2023',
  })
  start_date: string | Date;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: Date,
    description: 'Subscription start date',
    example: '10/09/2023',
  })
  end_date: string | Date;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: 'Subscription active or inactive',
    example: '1 or 0',
  })
  cron_check: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: subscriptionTypeEnum,
    description: 'Subscription type',
    example: 'manual or auto',
  })
  subscritpion_type: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Subscription details JSON',
    example: 'plan id invoice id',
  })
  subscription_details: string;
}
