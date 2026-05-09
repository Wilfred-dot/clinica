import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles('admin')
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('medico')
  @Roles('medico')
  getMedicoDashboard(@Request() req) {
    console.log("User ID from request:", req.user.userId); // Log do userId para depuração
    return this.dashboardService.getMedicoDashboard(req.user.userId); // Log do resultado do serviço para depuração
  }

  @Get('recepcao')
  @Roles('admin', 'recepcionista')
  getRecepcaoDashboard() {
    return this.dashboardService.getRecepcaoDashboard();
  }
}
