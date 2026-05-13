import { UserRole } from '../common/enums';
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MedicosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMedicoDto) {
    const existUser = await this.prisma.users.findUnique({ where: { email: dto.email } });
    if (existUser) throw new ConflictException('Email já existe');
    const existOrdem = await this.prisma.medicos.findUnique({ where: { numero_ordem: dto.numero_ordem } });
    if (existOrdem) throw new ConflictException('Número de ordem já existe');

    const hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: { name: dto.name, email: dto.email, password: hash, role: UserRole.MEDICO },
      });
      return tx.medicos.create({
        data: {
          user_id: user.id,
          especialidade: dto.especialidade,
          numero_ordem: dto.numero_ordem,
          telefone: dto.telefone,
          horario_trabalho: dto.horario_trabalho,
        },
        include: { users: { select: { id: true, name: true, email: true, role: true, ativo: true } } },
      });
    });
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const where: any = {};
    if (search) {
      where.users = { name: { contains: search, mode: 'insensitive' } };
    }

    const [data, total] = await Promise.all([
      this.prisma.medicos.findMany({
        where,
        include: {
          users: { select: { id: true, name: true, email: true, role: true, ativo: true } },
          consultas: { where: { data_hora: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.medicos.count({ where }),
    ]);

    const medicos = data.map(m => ({
      id: m.id,
      user_id: m.user_id,
      especialidade: m.especialidade,
      numero_ordem: m.numero_ordem,
      telefone: m.telefone,
      horario_trabalho: m.horario_trabalho,
      users: m.users,
      consultas_mes: m.consultas.length,
    }));

    return {
      data: medicos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const medico = await this.prisma.medicos.findUnique({
      where: { id },
      include: { users: { select: { id: true, name: true, email: true, role: true, ativo: true } } },
    });
    if (!medico) throw new NotFoundException('Médico não encontrado');
    return medico;
  }

  async findByUserId(userId: number) {
    const medico = await this.prisma.medicos.findUnique({
      where: { user_id: userId },
      include: { users: { select: { id: true, name: true, email: true, role: true, ativo: true } } },
    });
    if (!medico) throw new NotFoundException('Médico não encontrado');
    return medico;
  }

  async update(id: number, dto: UpdateMedicoDto) {
    await this.findOne(id);
    return this.prisma.medicos.update({
      where: { id },
      data: dto,
      include: { users: { select: { id: true, name: true, email: true, role: true, ativo: true } } },
    });
  }

  async remove(id: number) {
    const medico = await this.findOne(id);
    await this.prisma.medicos.delete({ where: { id } });
    await this.prisma.users.delete({ where: { id: medico.user_id } });
    return { message: 'Médico removido' };
  }
}