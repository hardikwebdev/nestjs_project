import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'reset token',
    example: 'resettoken##44',
  })
  resetToken: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'password',
    example: '12345678',
  })
  newPassword: string;
}
