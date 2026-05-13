import { IsIn } from 'class-validator';
import { UserRole } from '../../common/enums';
﻿import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreatePrescricaoDto {
  @IsInt()
  consulta_id: number;

  @IsString()
  medicamento: string;

  @IsString()
  dosagem: string;

  @IsOptional()
  @IsString()
  instrucoes?: string;
}
