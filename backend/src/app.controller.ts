import { UserRole } from './common/enums';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('ping')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async ping() {
    const tables = await this.prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    return { status: 'ok', tables };
  }
}