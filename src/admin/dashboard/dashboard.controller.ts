import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../category/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('/admin/dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('/')
  getSliders(@Res() res: Response): any {
    return this.dashboardService.getDashboardData(res);
  }
}
