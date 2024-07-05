import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { UserActivityLogs } from 'src/database/entities/user_activity_logs.entity';

@Injectable()
export class LogsMiddleware implements NestMiddleware {
  constructor(
    @Inject('USER_ACTIVITY_LOGS_REPOSITORY')
    private readonly userActivityLogsRepository: Repository<UserActivityLogs>,
  ) {}

  async use(req: any, res: Response, next: () => void) {
    const { method, originalUrl } = req;

    if (method !== 'GET' && req.user && req.user.id) {
      const requestBody = JSON.stringify({
        body: req.body,
        query: req.query,
      });

      res.on('finish', async () => {
        const { statusCode } = res;
        const apiLog = this.userActivityLogsRepository.create({
          user_id: req.user.id,
          method,
          original_url: originalUrl,
          status_code: statusCode,
          request_data: requestBody,
          response_data: JSON.stringify(res.locals.responseBody), // Assuming you store the response in res.locals.responseBody
        });

        req.on('error', (error: any) => {
          console.error('Error in data event:', error);
        });

        await this.userActivityLogsRepository.save(apiLog);
      });
    }

    next();
  }
}
