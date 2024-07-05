import { Module, MiddlewareConsumer } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { LogsMiddleware } from '../middleware/logs.middleware';
import { JwtStrategy } from '../category/jwt.strategy';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DashboardController],
  providers: [JwtStrategy, DashboardService],
})
export class DashboardModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes(DashboardController);
  }
}
