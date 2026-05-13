import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateMedicoDto } from './create-medico.dto';

export class UpdateMedicoDto extends PartialType(OmitType(CreateMedicoDto, ['email'] as const)) {}