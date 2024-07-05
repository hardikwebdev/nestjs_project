import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Users First Name',
    example: 'Test',
  })
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Users Last Name',
    example: 'Test',
  })
  last_name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Bio',
    example: 'I am blogger',
  })
  bio: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description:
      'Image base64 for adding or updating the users profile image otherwise just send null or already uploaded image url',
    example: 'base64 String',
  })
  profile_url: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: 'User active status',
    example: '0 for inactive or 1 for active',
  })
  status: number;

  static allowedKeys = [
    'email',
    'first_name',
    'last_name',
    'bio',
    'profile_url',
    'status',
  ];
}
