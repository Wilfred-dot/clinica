import { IsIn } from 'class-validator';
import { UserRole } from '../../common/enums';
﻿import { IsString, IsOptional } from 'class-validator';

export class UpdatePrescricaoDto {
  @IsOptional()
  @IsString()
  medicamento?: string;

  @IsOptional()
  @IsString()
  dosagem?: string;

  @IsOptional()
  @IsString()
  instrucoes?: string;
}
