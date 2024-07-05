import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BookmarkDto } from './bookmark.dto';

export class SyncBookmarkDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookmarkDto)
  @ApiProperty({
    type: [BookmarkDto],
    description: 'Array of bookmark data',
    example: '[{ user_id: 1, blog_id: 1, bookmarked: true }]',
  })
  bookmarkData: BookmarkDto[];
}
