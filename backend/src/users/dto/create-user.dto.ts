import { UserRole } from '../../common/enums';
﻿import { IsEmail, IsString, MinLength, IsIn, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsIn(Object.values(UserRole))
  @IsIn(Object.values(UserRole))
  role: UserRole;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
