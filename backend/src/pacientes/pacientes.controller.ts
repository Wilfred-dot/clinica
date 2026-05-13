import { UserRole } from '../common/enums';
﻿import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Controller('pacientes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA)
  create(@Body() dto: CreatePacienteDto) {
    return this.pacientesService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.MEDICO)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.pacientesService.findAll(
      page ? +page : 1,
      limit ? +limit : 10,
      search,
    );
  }

  @Get('me')
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.MEDICO, UserRole.PACIENTE)
  findMe(@Request() req) {
    return this.pacientesService.findByUserId(req.user.userId);
  }

  @Get(':id/historico')
  getHistorico(@Param('id') id: string, @Request() req) {
    return this.pacientesService.getHistorico(+id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const paciente = await this.pacientesService.findOne(+id);
    if (req.user.role === UserRole.PACIENTE && paciente.user_id !== req.user.userId) {
      throw new ForbiddenException('Acesso negado');
    }
    return paciente;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePacienteDto) {
    return this.pacientesService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.pacientesService.remove(+id);
  }
}
