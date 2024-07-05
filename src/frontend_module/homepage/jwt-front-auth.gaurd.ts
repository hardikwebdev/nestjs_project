import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtFrontAuthGuard extends AuthGuard('jwt_front') {}
