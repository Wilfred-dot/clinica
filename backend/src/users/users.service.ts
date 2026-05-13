import { UserRole } from '../common/enums';
﻿import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
  const existing = await this.prisma.users.findUnique({
    where: { email: createUserDto.email },
  });

  if (existing) {
    throw new ConflictException('Email já existe');
  }

  const hash = await bcrypt.hash(createUserDto.password, 10);

  return this.prisma.$transaction(async (tx) => {
    // criar utilizador
    const user = await tx.users.create({
      data: {
        ...createUserDto,
        password: hash,
        ativo: createUserDto.ativo ?? true,
      },
    });

    // criar médico automaticamente
    if (createUserDto.role === UserRole.MEDICO) {
      await tx.medicos.create({
        data: {
          user_id: user.id,
          especialidade: 'Geral',
          numero_ordem: `MED-${user.id}`,
        },
      });
    }

    // criar paciente automaticamente
    if (createUserDto.role === UserRole.PACIENTE) {
      await tx.pacientes.create({
        data: {
          user_id: user.id,
          data_nascimento: new Date('2000-01-01'),
          endereco: 'Por definir',
        },
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ativo: user.ativo,
      created_at: user.created_at,
    };
  });
}

  async findAll(page = 1, limit = 10, search?: string, ativo?: boolean) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (ativo !== undefined) where.ativo = ativo;

    const [data, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, ativo: true, created_at: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilizador não encontrado');
    const { password, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    const data: any = { ...updateUserDto };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    return this.prisma.users.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, ativo: true, created_at: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.users.delete({ where: { id } });
    return { message: 'Utilizador removido' };
  }
}
