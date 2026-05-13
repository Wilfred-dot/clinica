import { UserRole } from '../common/enums';
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';

@Injectable()
export class ConsultasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConsultaDto, currentUserId: number, currentRole: string) {
    const dataHora = new Date(dto.data_hora);
    if (dataHora <= new Date()) throw new BadRequestException('A data da consulta deve ser futura');
    if (currentRole === UserRole.PACIENTE) {
      const paciente = await this.prisma.pacientes.findUnique({ where: { user_id: currentUserId } });
      if (!paciente) throw new NotFoundException('Paciente não encontrado');
      dto.paciente_id = paciente.id;
    }
    const paciente = await this.prisma.pacientes.findUnique({ where: { id: dto.paciente_id } });
    if (!paciente) throw new NotFoundException('Paciente não encontrado');
    const conflitoMedico = await this.prisma.consultas.findFirst({
      where: { medico_id: dto.medico_id, data_hora: dataHora, status: { notIn: ['cancelada'] } },
    });
    if (conflitoMedico) throw new BadRequestException('O médico já tem uma consulta marcada nesse horário');
    const conflitoPaciente = await this.prisma.consultas.findFirst({
      where: { paciente_id: dto.paciente_id, data_hora: dataHora, status: { notIn: ['cancelada'] } },
    });
    if (conflitoPaciente) throw new BadRequestException('O paciente já tem uma consulta marcada nesse horário');
    return this.prisma.consultas.create({
      data: { paciente_id: dto.paciente_id, medico_id: dto.medico_id, data_hora: dataHora, status: 'agendada', observacoes: dto.observacoes },
      include: {
        pacientes: { include: { users: { select: { id: true, name: true, email: true } } } },
        medicos:   { include: { users: { select: { id: true, name: true, email: true } } } },
      },
    });
  }

  async findAll(filtros?: { data?: string; medico_id?: number; paciente_id?: number }) {
    const where: any = {};
    if (filtros?.data) where.data_hora = { gte: new Date(filtros.data) };
    if (filtros?.medico_id) where.medico_id = filtros.medico_id;
    if (filtros?.paciente_id) where.paciente_id = filtros.paciente_id;
    return this.prisma.consultas.findMany({
      where,
      include: {
        pacientes: { include: { users: { select: { id: true, name: true, email: true } } } },
        medicos:   { include: { users: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { data_hora: 'asc' },
    });
  }

  async findOne(id: number) {
    const consulta = await this.prisma.consultas.findUnique({
      where: { id },
      include: {
        pacientes: {
          include: {
            users: { select: { id: true, name: true, email: true } },
            consultas: { select: { id: true, data_hora: true, status: true, observacoes: true, medico_id: true }, orderBy: { data_hora: 'desc' }, take: 10 },
          },
        },
        medicos: { include: { users: { select: { id: true, name: true, email: true } } } },
      },
    });
    if (!consulta) throw new NotFoundException('Consulta não encontrada');
    return consulta;
  }

  async update(id: number, dto: UpdateConsultaDto, currentUserId: number, currentRole: string) {
    const consulta = await this.prisma.consultas.findUnique({ where: { id }, include: { medicos: true } });
    if (!consulta) throw new NotFoundException('Consulta não encontrada');
    if (dto.status) {
      if (dto.status === 'realizada') {
        if (currentRole !== UserRole.MEDICO || consulta.medicos.user_id !== currentUserId) throw new ForbiddenException('Apenas o médico responsável pode realizar a consulta');
        if (!dto.motivo || !dto.acuidade_visual || !dto.pressao_intraocular || !dto.diagnostico || !dto.plano_tratamento) throw new BadRequestException('Todos os campos clínicos são obrigatórios para realizar a consulta');
      }
      if (dto.status === 'cancelada') {
        if (![UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.PACIENTE].includes(currentRole as UserRole)) throw new ForbiddenException('Não tem permissão para cancelar uma consulta');
        if (currentRole !== UserRole.ADMIN) {
          const agora = new Date();
          const diffHoras = (consulta.data_hora.getTime() - agora.getTime()) / (1000 * 60 * 60);
          if (diffHoras < 24) throw new BadRequestException('Só é possível cancelar com pelo menos 24 horas de antecedência');
        }
      }
      if (dto.status === 'confirmada') {
        if (![UserRole.ADMIN, UserRole.RECEPCIONISTA].includes(currentRole as UserRole)) throw new ForbiddenException('Apenas admin ou recepcionista podem confirmar uma consulta');
      }
    }

    const data: any = {};
    if (dto.status) data.status = dto.status;
    if (dto.observacoes) data.observacoes = dto.observacoes;
    if (dto.motivo !== undefined) data.motivo = dto.motivo;
    if (dto.acuidade_visual !== undefined) data.acuidade_visual = dto.acuidade_visual;
    if (dto.pressao_intraocular !== undefined) data.pressao_intraocular = dto.pressao_intraocular;
    if (dto.diagnostico !== undefined) data.diagnostico = dto.diagnostico;
    if (dto.plano_tratamento !== undefined) data.plano_tratamento = dto.plano_tratamento;

    return this.prisma.consultas.update({
      where: { id },
      data,
      include: {
        pacientes: { include: { users: { select: { id: true, name: true, email: true } } } },
        medicos:   { include: { users: { select: { id: true, name: true, email: true } } } },
      },
    });
  }

  async getSemana(dataReferencia: string) {
    const ref = new Date(dataReferencia);
    const diaSemana = ref.getDay();
    const segunda = new Date(ref);
    segunda.setDate(ref.getDate() - ((diaSemana + 6) % 7));
    segunda.setHours(0, 0, 0, 0);
    const domingo = new Date(segunda);
    domingo.setDate(segunda.getDate() + 7);

    const consultas = await this.prisma.consultas.findMany({
      where: {
        data_hora: { gte: segunda, lt: domingo },
        status: { not: 'cancelada' },
      },
      include: {
        pacientes: { select: { id: true, users: { select: { name: true } } } },
        medicos:   { select: { id: true, users: { select: { name: true } } } },
      },
      orderBy: { data_hora: 'asc' },
    });

    const mapa: any = {};
    for (const c of consultas) {
      const chaveData = c.data_hora.toISOString().slice(0, 10);
      if (!mapa[chaveData]) mapa[chaveData] = {};
      const chaveMedico = c.medico_id.toString();
      if (!mapa[chaveData][chaveMedico]) mapa[chaveData][chaveMedico] = [];
      mapa[chaveData][chaveMedico].push({
        id: c.id,
        hora: c.data_hora.toISOString().slice(11, 16),
        paciente: c.pacientes?.users?.name,
        status: c.status,
      });
    }
    return mapa;
  }
}
