import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class CommonGetDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    const parsedValue = parseInt(value, 10);

    if (!isNaN(parsedValue) && parsedValue >= 0) {
      return parsedValue;
    } else {
      return 1;
    }
  })
  @ApiProperty({
    type: Number,
    description: 'Page Number',
    example: '1',
  })
  page: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    const parsedValue = parseInt(value, 10);

    if (!isNaN(parsedValue) && parsedValue >= 0) {
      return parsedValue;
    } else {
      return 10;
    }
  })
  @ApiProperty({
    type: String,
    description: 'Page Size',
    example: '10',
  })
  pageSize: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Id or name etc',
    example: 'id',
  })
  sortBy: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (['ASC', 'DESC', 'asc', 'desc'].includes(value)) {
      return value.toUpperCase();
    } else {
      return 'DESC';
    }
  })
  @ApiProperty({
    type: String,
    description: 'Ascending or Descending',
    example: 'ASC',
  })
  sortOrder: string;
}
