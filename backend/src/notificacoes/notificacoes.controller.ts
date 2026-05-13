import { UserRole } from '../common/enums';
import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NotificacoesService } from './notificacoes.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { UpdateNotificacaoDto } from './dto/update-notificacao.dto';

@Controller('notificacoes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA)
  create(@Body() dto: CreateNotificacaoDto) {
    return this.notificacoesService.create(dto);
  }

  @Post('lembrete/:consultaId')
  enviarLembrete(@Param('consultaId') consultaId: string) {
    return this.notificacoesService.enviarLembreteConsulta(+consultaId);
  }

  @Get('minhas')
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.MEDICO, UserRole.PACIENTE)
  minhas(@Request() req) {
    if (req.user.role === UserRole.PACIENTE) {
      return this.notificacoesService.findByUserId(req.user.userId);
    }
    return this.notificacoesService.findAll();
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.MEDICO)
  findAll(@Query() filtros: any) {
    return this.notificacoesService.findAll(filtros);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const notif = await this.notificacoesService.findOne(+id);
    if (req.user.role === UserRole.PACIENTE && notif.pacientes.user_id !== req.user.userId) {
      throw new ForbiddenException('Apenas pode visualizar as suas próprias notificações');
    }
    return notif;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNotificacaoDto) {
    return this.notificacoesService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.notificacoesService.remove(+id);
  }
}