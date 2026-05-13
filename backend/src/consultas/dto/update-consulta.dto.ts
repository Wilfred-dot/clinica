import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateConsultaDto {
  @IsOptional()
  @IsString()
  @IsIn(['agendada', 'confirmada', 'realizada', 'cancelada'])
  status?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  acuidade_visual?: string;

  @IsOptional()
  @IsString()
  pressao_intraocular?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  plano_tratamento?: string;
}
