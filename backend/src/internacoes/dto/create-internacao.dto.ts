import { IsIn } from 'class-validator';
import { UserRole } from '../../common/enums';
﻿import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateInternacaoDto {
  @IsInt()
  paciente_id: number;

  @IsDateString()
  data_entrada: string;

  @IsOptional()
  @IsDateString()
  data_reintegracao?: string;

  @IsString()
  causa: string;
}
