import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'verification token',
    example: 'verificationtoken##44',
  })
  verificationToken: string;
}
