import { IsIn } from 'class-validator';
import { UserRole } from '../../common/enums';
﻿import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
