import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, NotificacoesModule],
  providers: [TasksService],
})
export class TasksModule {}
