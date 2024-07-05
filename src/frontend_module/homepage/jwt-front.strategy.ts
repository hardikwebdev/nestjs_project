import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Users } from 'src/database/entities/user.entity';

@Injectable()
export class JwtFrontStrategy extends PassportStrategy(Strategy, 'jwt_front') {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<Users>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SCERET_KEY ||
        '5JLMIBTPGCFlVYX0NWBIfxauocnstuBH1PwhZA46DOkNDJe37wTtFOnG',
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const userData = await this.userRepository.findOne({
      where: {
        id: payload.userId,
      },
    });

    if (!userData || ![2].includes(userData.role)) {
      throw new UnauthorizedException('Unauthorised user');
    }

    if (userData.status !== 1) {
      throw new UnauthorizedException('Your account has been inactivated!');
    }

    delete userData['password'];
    return { ...userData };
  }
}
