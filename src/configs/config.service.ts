import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  static getDotenvConfigs(): string {
    let dotenvFilePath = '.env';

    const environment = process.env.ENV || process.env.NODE_ENV;

    switch (environment) {
      case 'production':
        dotenvFilePath = '.env.production';
        break;
      case 'development':
        dotenvFilePath = '.env.dev';
        break;
      case 'staging':
        dotenvFilePath = '.env.staging';
        break;
      default:
        dotenvFilePath = '.env';
        break;
    }
    return dotenvFilePath;
  }
}
