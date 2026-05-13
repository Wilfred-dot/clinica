import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private notificacoesService: NotificacoesService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async enviarLembretesConsultas() {
    this.logger.log('Verificando consultas para envio de lembretes...');
    const agora = new Date();
    const em24Horas = new Date(agora.getTime() + 24 * 60 * 60 * 1000);

    const consultas = await this.prisma.consultas.findMany({
      where: {
        data_hora: {
          gte: agora,
          lte: em24Horas,
        },
        status: 'agendada',
      },
      include: {
        pacientes: { include: { users: true } },
        medicos: { include: { users: true } },
      },
    });

    for (const consulta of consultas) {
      const lembreteExistente = await this.prisma.notificacoes.findFirst({
        where: {
          paciente_id: consulta.paciente_id,
          tipo_variavel: 'lembrete_consulta',
          data_envio: {
            gte: new Date(agora.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (lembreteExistente) {
        continue;
      }

      const mensagem = `Lembrete: tem uma consulta agendada com Dr. ${consulta.medicos.users.name} amanhã às ${consulta.data_hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`;
      
      await this.notificacoesService.create({
        paciente_id: consulta.paciente_id,
        mensagem,
        tipo_variavel: 'lembrete_consulta',
      });
      
      this.logger.log(`Lembrete criado para consulta #${consulta.id}`);
    }
    this.logger.log(`Total de lembretes enviados: ${consultas.length}`);
  }
}
