import { UserRole } from '../common/enums';
﻿import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RelatoriosService } from './relatorios.service';

@Controller('relatorios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('consultas-por-medico')
  consultasPorMedico(@Query('dataInicio') dataInicio?: string, @Query('dataFim') dataFim?: string) {
    return this.relatoriosService.consultasPorMedico(dataInicio, dataFim);
  }

  @Get('diagnosticos-comuns')
  diagnosticosMaisComuns() {
    return this.relatoriosService.diagnosticosMaisComuns();
  }

  @Get('resumo')
  resumoGeral() {
    return this.relatoriosService.resumoGeral();
  }

  // ─── NOVA ROTA ──────────────────────────────
  @Get('consultas-por-dia')
  consultasPorDia(@Query('mes') mes: string) {
    return this.relatoriosService.consultasPorDia(mes || new Date().toISOString().slice(0,7));
  }
}
