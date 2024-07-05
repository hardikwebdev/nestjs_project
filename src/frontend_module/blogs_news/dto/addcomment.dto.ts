import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  // Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCommentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Users Name',
    example: 'Dummy James',
  })
  name: string;

  @IsNotEmpty()
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
    description: 'Comment on the blog or news',
    example: 'Nice blog',
  })
  comment: string;

  @IsOptional()
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
    description: 'Blog Id',
    example: '1',
  })
  blog_id: number;

  static sortAbleKeys = ['name', 'email', 'id', 'createdAt', 'updatedAt'];
}
