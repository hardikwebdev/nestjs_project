import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BookmarkDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: 'User id',
    example: '1',
  })
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: 'Blog id',
    example: '1',
  })
  blog_id: number;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: 'Is Bookmarked or not',
    example: 'true or false',
  })
  bookmarked: boolean;

  static sortAbleKeys = ['id', 'createdAt', 'updatedAt'];
}
