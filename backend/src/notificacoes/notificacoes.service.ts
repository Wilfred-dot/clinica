import { UserRole } from '../common/enums';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { UpdateNotificacaoDto } from './dto/update-notificacao.dto';

@Injectable()
export class NotificacoesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificacaoDto) {
    const paciente = await this.prisma.pacientes.findUnique({ where: { id: dto.paciente_id } });
    if (!paciente) throw new NotFoundException('Paciente não encontrado');

    return this.prisma.notificacoes.create({
      data: {
        paciente_id: dto.paciente_id,
        mensagem: dto.mensagem,
        tipo_variavel: dto.tipo_variavel || 'lembrete_consulta',
        status_envio: 'pendente',
      },
    });
  }

  async findAll(filtros?: { paciente_id?: number; status_envio?: string }) {
    const where: any = {};
    if (filtros?.paciente_id) where.paciente_id = filtros.paciente_id;
    if (filtros?.status_envio) where.status_envio = filtros.status_envio;
    return this.prisma.notificacoes.findMany({
      where,
      include: { pacientes: { include: { users: { select: { id: true, name: true, email: true } } } } },
      orderBy: { data_envio: 'desc' },
    });
  }

  async findOne(id: number) {
    const notif = await this.prisma.notificacoes.findUnique({
      where: { id },
      include: { pacientes: { include: { users: { select: { id: true, name: true, email: true } } } } },
    });
    if (!notif) throw new NotFoundException('Notificação não encontrada');
    return notif;
  }

  async update(id: number, dto: UpdateNotificacaoDto) {
    await this.findOne(id);
    return this.prisma.notificacoes.update({
      where: { id },
      data: { status_envio: dto.status_envio },
      include: { pacientes: { include: { users: { select: { id: true, name: true, email: true } } } } },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.notificacoes.delete({ where: { id } });
    return { message: 'Notificação removida' };
  }

  async enviarLembreteConsulta(consultaId: number) {
    const consulta = await this.prisma.consultas.findUnique({
      where: { id: consultaId },
      include: { pacientes: true, medicos: { include: { users: true } } },
    });
    if (!consulta) throw new NotFoundException('Consulta não encontrada');

    const mensagem = `Lembrete: tem uma consulta agendada com Dr. ${consulta.medicos.users.name} no dia ${consulta.data_hora.toLocaleString('pt-BR')}.`;
    return this.create({
      paciente_id: consulta.paciente_id,
      mensagem,
      tipo_variavel: 'lembrete_consulta',
    });
  }

  async findByUserId(userId: number) {
    const paciente = await this.prisma.pacientes.findUnique({ where: { user_id: userId } });
    if (!paciente) throw new NotFoundException('Paciente não encontrado');
    return this.findAll({ paciente_id: paciente.id });
  }
}
