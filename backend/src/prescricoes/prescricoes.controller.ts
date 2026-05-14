import { UserRole } from '../common/enums';
import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrescricoesService } from './prescricoes.service';
import { CreatePrescricaoDto } from './dto/create-prescricao.dto';
import { UpdatePrescricaoDto } from './dto/update-prescricao.dto';

@Controller('prescricoes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PrescricoesController {
  constructor(private readonly prescricoesService: PrescricoesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MEDICO)
  create(@Body() dto: CreatePrescricaoDto, @Request() req) {
    return this.prescricoesService.create(dto, req.user.userId, req.user.role);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MEDICO, UserRole.RECEPCIONISTA, UserRole.PACIENTE)
  findAll(@Query() filtros: any, @Request() req) {
    return this.prescricoesService.findAll(filtros, req.user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MEDICO, UserRole.RECEPCIONISTA, UserRole.PACIENTE)
  findOne(@Param('id') id: string, @Request() req) {
    return this.prescricoesService.findOne(+id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MEDICO)
  update(@Param('id') id: string, @Body() dto: UpdatePrescricaoDto, @Request() req) {
    return this.prescricoesService.update(+id, dto, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MEDICO)
  remove(@Param('id') id: string, @Request() req) {
    return this.prescricoesService.remove(+id, req.user.userId, req.user.role);
  }
}
