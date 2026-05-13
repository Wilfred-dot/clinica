import { IsIn } from 'class-validator';
import { UserRole } from '../../common/enums';
﻿import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateInternacaoDto {
  @IsOptional()
  @IsDateString()
  data_entrada?: string;

  @IsOptional()
  @IsDateString()
  data_reintegracao?: string;

  @IsOptional()
  @IsString()
  causa?: string;
}
