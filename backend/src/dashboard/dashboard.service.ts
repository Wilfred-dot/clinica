import { UserRole } from '../common/enums';
﻿import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard() {
    const [totalConsultas, totalPacientes, totalMedicos, consultasHoje, ultimasConsultas, actividadeRecente] =
      await Promise.all([
        this.prisma.consultas.count(),
        this.prisma.pacientes.count(),
        this.prisma.medicos.count(),
        this.prisma.consultas.findMany({
          where: {
            data_hora: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(24, 0, 0, 0)),
            },
          },
          include: {
            pacientes: { include: { users: { select: { id: true, name: true } } } },
            medicos:   { include: { users: { select: { id: true, name: true } } } },
          },
          orderBy: { data_hora: 'asc' },
        }),
        this.prisma.consultas.findMany({
          take: 10,
          orderBy: { data_hora: 'desc' },
          include: {
            pacientes: { include: { users: { select: { id: true, name: true } } } },
            medicos:   { include: { users: { select: { id: true, name: true } } } },
          },
        }),
        this.prisma.notificacoes.findMany({
          take: 5,
          orderBy: { data_envio: 'desc' },
          include: { pacientes: { include: { users: { select: { id: true, name: true } } } } },
        }),
      ]);

    return {
      totalConsultas,
      totalPacientes,
      totalMedicos,
      consultasHoje,
      ultimasConsultas,
      actividadeRecente: actividadeRecente.map(n => ({
        id: n.id,
        mensagem: n.mensagem,
        paciente: n.pacientes?.users?.name,
        data: n.data_envio,
      })),
    };
  }

  async getMedicoDashboard(userId: number) {
    const medico = await this.prisma.medicos.findUnique({ where: { user_id: userId } });
    if (!medico) throw new Error('Médico não encontrado');

    const [consultasHoje, ultimasFichas] = await Promise.all([
      this.prisma.consultas.findMany({
        where: {
          medico_id: medico.id,
          data_hora: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(24, 0, 0, 0)),
          },
        },
        include: {
          pacientes: { include: { users: { select: { id: true, name: true } } } },
        },
        orderBy: { data_hora: 'asc' },
      }),
      this.prisma.consultas.findMany({
        where: { medico_id: medico.id },
        take: 5,
        orderBy: { data_hora: 'desc' },
        include: {
          pacientes: { include: { users: { select: { id: true, name: true } } } },
        },
      }),
    ]);

    return {
      consultasHoje: {
        total: consultasHoje.length,
        lista: consultasHoje,
      },
      ultimasFichas: ultimasFichas.map(c => ({
        id: c.id,
        paciente: c.pacientes?.users?.name,
        data: c.data_hora,
        status: c.status,
      })),
    };
  }

  async getRecepcaoDashboard() {
    const consultasHoje = await this.prisma.consultas.findMany({
      where: {
        data_hora: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      },
      include: {
        pacientes: { include: { users: { select: { id: true, name: true } } } },
        medicos:   { include: { users: { select: { id: true, name: true } } } },
      },
      orderBy: { data_hora: 'asc' },
    });

    return {
      consultasHoje: {
        total: consultasHoje.length,
        lista: consultasHoje,
      },
    };
  }
}
