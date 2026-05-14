import { UserRole } from '../common/enums';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescricaoDto } from './dto/create-prescricao.dto';
import { UpdatePrescricaoDto } from './dto/update-prescricao.dto';

@Injectable()
export class PrescricoesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePrescricaoDto, currentUserId: number, currentRole: string) {
    // Verifica se a consulta existe e se o médico é o responsável (ou admin)
    const consulta = await this.prisma.consultas.findUnique({
      where: { id: dto.consulta_id },
      include: { medicos: true },
    });
    if (!consulta) throw new NotFoundException('Consulta não encontrada');

    if (currentRole !== UserRole.ADMIN && consulta.medicos.user_id !== currentUserId) {
      throw new ForbiddenException('Apenas o médico responsável pela consulta pode criar prescrições');
    }

    return this.prisma.prescricoes.create({
      data: {
        consulta_id: dto.consulta_id,
        medicamento: dto.medicamento,
        dosagem: dto.dosagem,
        instrucoes: dto.instrucoes,
      },
      include: {
        consultas: {
          select: {
            id: true,
            data_hora: true,
            pacientes: { include: { users: { select: { id: true, name: true } } } },
          },
        },
      },
    });
  }

  async findAll(
    filtros?: { consulta_id?: number; paciente_id?: number },
    user?: { userId: number; role: string },
  ) {
    const where: any = {};
    if (filtros?.consulta_id) where.consulta_id = filtros.consulta_id;

    if (user?.role === UserRole.PACIENTE) {
      const paciente = await this.prisma.pacientes.findUnique({
        where: { user_id: user.userId },
      });
      if (!paciente) throw new NotFoundException('Paciente não encontrado');
      where.consultas = { paciente_id: paciente.id };
    } else if (filtros?.paciente_id) {
      where.consultas = { paciente_id: filtros.paciente_id };
    }

    return this.prisma.prescricoes.findMany({
      where,
      include: {
        consultas: {
          select: {
            id: true,
            data_hora: true,
            pacientes: { include: { users: { select: { id: true, name: true } } } },
            medicos: { include: { users: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: { data_prescricao: 'desc' },
    });
  }

  async findOne(id: number, user?: { userId: number; role: string }) {
    const prescricao = await this.prisma.prescricoes.findUnique({
      where: { id },
      include: {
        consultas: {
          select: {
            id: true,
            data_hora: true,
            paciente_id: true,
            pacientes: { include: { users: { select: { id: true, name: true } } } },
            medicos: { include: { users: { select: { id: true, name: true } } } },
          },
        },
      },
    });
    if (!prescricao) throw new NotFoundException('Prescrição não encontrada');

    if (user?.role === UserRole.PACIENTE) {
      const paciente = await this.prisma.pacientes.findUnique({
        where: { user_id: user.userId },
      });
      if (!paciente || prescricao.consultas.paciente_id !== paciente.id) {
        throw new ForbiddenException('Não tem acesso a esta prescrição');
      }
    }

    return prescricao;
  }

  async update(id: number, dto: UpdatePrescricaoDto, currentUserId: number, currentRole: string) {
    const prescricao = await this.prisma.prescricoes.findUnique({
      where: { id },
      include: { consultas: { include: { medicos: true } } },
    });
    if (!prescricao) throw new NotFoundException('Prescrição não encontrada');

    if (currentRole !== UserRole.ADMIN && prescricao.consultas.medicos.user_id !== currentUserId) {
      throw new ForbiddenException('Apenas o médico responsável ou admin podem editar esta prescrição');
    }

    return this.prisma.prescricoes.update({
      where: { id },
      data: {
        medicamento: dto.medicamento,
        dosagem: dto.dosagem,
        instrucoes: dto.instrucoes,
      },
      include: {
        consultas: {
          select: {
            id: true,
            data_hora: true,
            pacientes: { include: { users: { select: { id: true, name: true } } } },
          },
        },
      },
    });
  }

  async remove(id: number, currentUserId: number, currentRole: string) {
    const prescricao = await this.prisma.prescricoes.findUnique({
      where: { id },
      include: { consultas: { include: { medicos: true } } },
    });
    if (!prescricao) throw new NotFoundException('Prescrição não encontrada');

    if (currentRole !== UserRole.ADMIN && prescricao.consultas.medicos.user_id !== currentUserId) {
      throw new ForbiddenException('Apenas o médico responsável ou admin podem remover esta prescrição');
    }

    await this.prisma.prescricoes.delete({ where: { id } });
    return { message: 'Prescrição removida' };
  }
}
