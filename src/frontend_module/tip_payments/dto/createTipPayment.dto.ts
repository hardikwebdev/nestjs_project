import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTipPaymentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Name',
    example: 'Test User',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    type: String,
    description: 'email',
    example: 'test@example.com',
  })
  email: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: 'Amount',
    example: 10,
  })
  amount: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Message',
    example: 10,
  })
  message: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: 'User id',
    example: 4,
  })
  user_id: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'dataValue',
    example: 'opaqueDataValue',
  })
  data_value: string;
}
