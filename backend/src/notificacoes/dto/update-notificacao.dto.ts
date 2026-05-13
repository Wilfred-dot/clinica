import { UserRole } from '../../common/enums';
﻿import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateNotificacaoDto {
  @IsOptional()
  @IsString()
  @IsIn(['pendente', 'enviado', 'entregue', 'falhou'])
  status_envio?: string;
}
