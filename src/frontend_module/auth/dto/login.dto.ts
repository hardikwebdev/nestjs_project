import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
    description: 'password',
    example: '12345678',
  })
  password: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: 'Is remember me true or false',
    example: 'true or false',
  })
  remember_me: boolean;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'reCaptchaToken',
    example: 'reCaptchaToken',
  })
  reCaptchaToken: string;
}
