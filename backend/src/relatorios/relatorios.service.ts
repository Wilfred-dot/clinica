import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  async consultasPorMedico(dataInicio?: string, dataFim?: string) {
    const where: any = {};
    if (dataInicio) where.data_hora = { gte: new Date(dataInicio) };
    if (dataFim) where.data_hora = { ...where.data_hora, lte: new Date(dataFim) };
    const resultado = await this.prisma.consultas.groupBy({
      by: ['medico_id'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    const medicoIds = resultado.map(r => r.medico_id);
    const medicos = await this.prisma.medicos.findMany({
      where: { id: { in: medicoIds } },
      include: { users: { select: { name: true } } },
    });
    return resultado.map(r => ({
      medico_id: r.medico_id,
      nome: medicos.find(m => m.id === r.medico_id)?.users?.name || 'Desconhecido',
      total_consultas: r._count.id,
    }));
  }

  async diagnosticosMaisComuns() {
    const resultado = await this.prisma.consultas.groupBy({
      by: ['diagnostico'],
      where: { status: 'realizada', diagnostico: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
    return resultado.map(r => ({
      diagnostico: r.diagnostico,
      total: r._count.id,
    }));
  }

  async resumoGeral() {
    const [totalConsultas, totalPacientes, totalMedicos, consultasRealizadas] = await Promise.all([
      this.prisma.consultas.count(),
      this.prisma.pacientes.count(),
      this.prisma.medicos.count(),
      this.prisma.consultas.count({ where: { status: 'realizada' } }),
    ]);
    return {
      total_consultas: totalConsultas,
      total_pacientes: totalPacientes,
      total_medicos: totalMedicos,
      consultas_realizadas: consultasRealizadas,
      taxa_conclusao: totalConsultas > 0 ? ((consultasRealizadas / totalConsultas) * 100).toFixed(2) + '%' : '0%',
    };
  }

  async consultasPorDia(mes: string) {
    const [ano, mesNum] = mes.split('-').map(Number);
    const inicio = new Date(ano, mesNum - 1, 1);
    const fim = new Date(ano, mesNum, 0, 23, 59, 59);

    const consultas = await this.prisma.consultas.findMany({
      where: {
        data_hora: { gte: inicio, lte: fim },
      },
      select: { data_hora: true },
    });

    const contagem: Record<number, number> = {};
    for (const c of consultas) {
      const dia = c.data_hora.getDate();
      contagem[dia] = (contagem[dia] || 0) + 1;
    }

    const diasNoMes = new Date(ano, mesNum, 0).getDate();
    const resultado = [];
    for (let d = 1; d <= diasNoMes; d++) {
      resultado.push({ dia: d, total: contagem[d] || 0 });
    }
    return resultado;
  }
}
