import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    description: 'User Id',
    example: '1',
  })
  id: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: 'Want to delete blogs with users?',
    example: 'true or false',
  })
  delete_blogs: boolean;
}
