import { UserRole } from '../common/enums';
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
  @Roles(UserRole.ADMIN)
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('medico')
  @Roles(UserRole.MEDICO)
  getMedicoDashboard(@Request() req) {
    return this.dashboardService.getMedicoDashboard(req.user.userId);
  }

  @Get('recepcao')
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA)
  getRecepcaoDashboard() {
    return this.dashboardService.getRecepcaoDashboard();
  }
}
