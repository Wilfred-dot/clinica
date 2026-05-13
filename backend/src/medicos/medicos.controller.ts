import { UserRole } from '../common/enums';
﻿import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';

@Controller('medicos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateMedicoDto) {
    return this.medicosService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.MEDICO)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.medicosService.findAll(
      page ? +page : 1,
      limit ? +limit : 10,
      search,
    );
  }

  @Get('me')
  @Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.MEDICO, UserRole.PACIENTE)
  findMe(@Request() req) {
    return this.medicosService.findByUserId(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMedicoDto) {
    return this.medicosService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicosService.remove(+id);
  }
}
