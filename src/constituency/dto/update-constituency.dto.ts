import { PartialType } from '@nestjs/mapped-types'
import { CreateConstituencyDto } from './create-constituency.dto'

export class UpdateConstituencyDto extends PartialType(CreateConstituencyDto) {}
