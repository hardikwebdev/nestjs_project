import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInviationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'invitation token',
    example: 'invitationtoken##44',
  })
  invitationToken: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'password',
    example: '12345678',
  })
  password: string;
}
