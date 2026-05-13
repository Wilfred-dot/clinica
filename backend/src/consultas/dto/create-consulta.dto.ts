import { IsIn } from 'class-validator';
import { UserRole } from '../../common/enums';
﻿import { IsInt, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateConsultaDto {
  @IsInt()
  paciente_id: number;

  @IsInt()
  medico_id: number;

  @IsDateString()
  data_hora: string;   // formato ISO 8601 (ex: "2026-05-15T09:00:00Z")

  @IsOptional()
  @IsString()
  observacoes?: string;
}
