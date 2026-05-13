import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePacienteDto } from './create-paciente.dto';

export class UpdatePacienteDto extends PartialType(OmitType(CreatePacienteDto, ['email'] as const)) {}