import { UserRole } from '../common/enums';
import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ConsultasService } from './consultas.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';

@Controller('consultas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ConsultasController {
  constructor(private readonly consultasService: ConsultasService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.PACIENTE)
  create(@Body() dto: CreateConsultaDto, @Request() req) {
    return this.consultasService.create(dto, req.user.userId, req.user.role);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.MEDICO, UserRole.PACIENTE)
  findAll(@Query() filtros: any, @Request() req) {
    return this.consultasService.findAllForUser(filtros, req.user);
  }

  // ─── NOVA ROTA ──────────────────────────────
  @Get('semana')
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.MEDICO)
  getSemana(@Query('data') data: string) {
    return this.consultasService.getSemana(data || new Date().toISOString().slice(0, 10));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.MEDICO, UserRole.PACIENTE)
  async findOne(@Param('id') id: string, @Request() req) {
    const consulta = await this.consultasService.findOne(+id);
    if (req.user.role === UserRole.PACIENTE && consulta.pacientes.user_id !== req.user.userId) {
      throw new ForbiddenException('Apenas pode visualizar as suas próprias consultas');
    }
    return consulta;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.MEDICO, UserRole.PACIENTE)
  update(@Param('id') id: string, @Body() dto: UpdateConsultaDto, @Request() req) {
    return this.consultasService.update(+id, dto, req.user.userId, req.user.role);
  }
}
