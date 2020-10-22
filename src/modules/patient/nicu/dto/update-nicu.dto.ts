import { PartialType } from '@nestjs/mapped-types';
import { CreateNicuDto } from './create-nicu.dto';

export class UpdateNicuDto extends PartialType(CreateNicuDto) {}