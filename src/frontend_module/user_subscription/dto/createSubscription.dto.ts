import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserSubscriptionDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    name: 'planId',
    description: 'plan id',
    example: 1,
  })
  plan_id: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: 'dataValue',
    description: 'Opaque data value',
    example: 'eyysdlkopqwenkjds...',
  })
  dataValue: string;
}
