import { UserRole } from '../../common/enums';
﻿import { IsInt, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateNotificacaoDto {
  @IsInt()
  paciente_id: number;

  @IsString()
  mensagem: string;

  @IsOptional()
  @IsString()
  @IsIn(['lembrete_consulta', 'confirmacao', 'resultado_exame', 'alerta'])
  tipo_variavel?: string;
}
