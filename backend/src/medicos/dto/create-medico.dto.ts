import { IsIn } from 'class-validator';
import { UserRole } from '../../common/enums';
﻿import { IsString, IsEmail, IsOptional, Matches } from 'class-validator';

export class CreateMedicoDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  especialidade: string;

  @IsString()
  numero_ordem: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}-\d{2}:\d{2}$/, { message: 'Formato inválido. Use HH:MM-HH:MM' })
  horario_trabalho?: string;
}
