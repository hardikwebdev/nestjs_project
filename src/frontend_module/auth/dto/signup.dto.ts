import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Users first name',
    example: 'Test',
  })
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Users last name',
    example: 'James',
  })
  last_name: string;

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
  @Length(8, 50, {
    message:
      'Password must be between $constraint1 and $constraint2 characters.',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
    },
  )
  @ApiProperty({
    type: String,
    description: 'password',
    example: 'tesT@1234',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'reCaptchaToken',
    example: 'reCaptchaToken',
  })
  reCaptchaToken: string;
}
