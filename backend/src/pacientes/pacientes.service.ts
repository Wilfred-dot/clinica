import { UserRole } from '../common/enums';
import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PacientesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePacienteDto) {
    const existUser = await this.prisma.users.findUnique({ where: { email: dto.email } });
    if (existUser) throw new ConflictException('Email já existe');
    const hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) =>  {
      const user = await tx.users.create({
        data: { name: dto.name, email: dto.email, password: hash, role: UserRole.PACIENTE },
      });
      return tx.pacientes.create({
        data: {
          user_id: user.id,
          data_nascimento: new Date(dto.data_nascimento),
          sexo: dto.sexo,
          telefone: dto.telefone,
          endereco: dto.endereco,
          historico_medico: dto.historico_medico,
        },
        include: { users: { select: { id: true, name: true, email: true, ativo: true } } },
      });
    });
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const where: any = {};
    if (search) {
      where.users = { name: { contains: search, mode: 'insensitive' } };
    }

    const [data, total] = await Promise.all([
      this.prisma.pacientes.findMany({
        where,
        include: {
          users: { select: { id: true, name: true, email: true, ativo: true } },
          consultas: { orderBy: { data_hora: 'desc' }, take: 1 },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.pacientes.count({ where }),
    ]);

    const pacientes = data.map(p => ({
      ...p,
      ultimo_atendimento: p.consultas.length > 0 ? p.consultas[0].data_hora : null,
      consultas: undefined,
    }));

    return {
      data: pacientes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const paciente = await this.prisma.pacientes.findUnique({
      where: { id },
      include: { users: { select: { id: true, name: true, email: true, ativo: true } } },
    });
    if (!paciente) throw new NotFoundException('Paciente não encontrado');
    return paciente;
  }

  async findByUserId(userId: number) {
    const paciente = await this.prisma.pacientes.findUnique({
      where: { user_id: userId },
      include: { users: { select: { id: true, name: true, email: true, ativo: true } } },
    });
    if (!paciente) throw new NotFoundException('Paciente não encontrado');
    return paciente;
  }

  async update(id: number, dto: UpdatePacienteDto) {
    const paciente = await this.findOne(id);
    return this.prisma.pacientes.update({
      where: { id },
      data: {
        data_nascimento: dto.data_nascimento ? new Date(dto.data_nascimento) : undefined,
        sexo: dto.sexo,
        telefone: dto.telefone,
        endereco: dto.endereco,
        historico_medico: dto.historico_medico,
      },
      include: { users: { select: { id: true, name: true, email: true, ativo: true } } },
    });
  }

  async remove(id: number) {
    const paciente = await this.findOne(id);
    await this.prisma.pacientes.delete({ where: { id } });
    if (paciente.user_id) {
      await this.prisma.users.delete({ where: { id: paciente.user_id } });
    }
    return { message: 'Paciente removido' };
  }

  async getHistoricoForUser(id: number, user: { userId: number; role: string }) {
    if (user.role === UserRole.PACIENTE) {
      const paciente = await this.prisma.pacientes.findUnique({
        where: { user_id: user.userId },
      });
      if (!paciente || paciente.id !== id) {
        throw new ForbiddenException('Só pode aceder ao seu próprio histórico');
      }
    }
    return this.getHistorico(id);
  }

  async getHistorico(id: number) {
    const paciente = await this.prisma.pacientes.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, ativo: true } },
        consultas: {
          orderBy: { data_hora: 'desc' },
          include: {
            medicos: { include: { users: { select: { name: true } } } },
            prescricoes: true,
          },
        },
      },
    });
    if (!paciente) throw new NotFoundException('Paciente não encontrado');

    const consultasFormatadas = paciente.consultas.map(c => ({
      id: c.id,
      data: c.data_hora,
      medico: c.medicos?.users?.name,
      status: c.status,
      diagnostico: c.diagnostico,
      prescricoes: c.prescricoes.map(p => ({
        medicamento: p.medicamento,
        dosagem: p.dosagem,
        data: p.data_prescricao,
      })),
    }));

    return {
      paciente: {
        id: paciente.id,
        nome: paciente.users?.name,
        email: paciente.users?.email,
        data_nascimento: paciente.data_nascimento,
        sexo: paciente.sexo,
        telefone: paciente.telefone,
        endereco: paciente.endereco,
        historico_medico: paciente.historico_medico,
        ativo: paciente.users?.ativo,
      },
      total_consultas: consultasFormatadas.length,
      consultas: consultasFormatadas,
    };
  }
}


