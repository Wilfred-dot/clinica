import { UserRole } from '../common/enums';
import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InternacoesService } from './internacoes.service';
import { CreateInternacaoDto } from './dto/create-internacao.dto';
import { UpdateInternacaoDto } from './dto/update-internacao.dto';

@Controller('internacoes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InternacoesController {
  constructor(private readonly internacoesService: InternacoesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MEDICO)
  create(@Body() dto: CreateInternacaoDto) {
    return this.internacoesService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MEDICO, UserRole.RECEPCIONISTA)
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.internacoesService.findAll(page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':nrProcesso')
  @Roles(UserRole.ADMIN, UserRole.MEDICO, UserRole.RECEPCIONISTA)
  findOne(@Param('nrProcesso') nrProcesso: string) {
    return this.internacoesService.findOne(nrProcesso);
  }

  @Patch(':nrProcesso')
  @Roles(UserRole.ADMIN, UserRole.MEDICO)
  update(@Param('nrProcesso') nrProcesso: string, @Body() dto: UpdateInternacaoDto) {
    return this.internacoesService.update(nrProcesso, dto);
  }

  @Delete(':nrProcesso')
  @Roles(UserRole.ADMIN)
  remove(@Param('nrProcesso') nrProcesso: string) {
    return this.internacoesService.remove(nrProcesso);
  }
}
