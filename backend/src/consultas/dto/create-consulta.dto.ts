import { IsInt, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateConsultaDto {
  @IsInt()
  paciente_id: number;

  @IsOptional()         // ✅ Opcional — paciente NÃO precisa escolher médico
  @IsInt()
  medico_id?: number;   // ✅ ? = opcional

  @IsDateString()
  data_hora: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}