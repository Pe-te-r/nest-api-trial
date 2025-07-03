import { PartialType } from '@nestjs/mapped-types'
import { CreateCountyDto } from './create-county.dto'

export class UpdateCountyDto extends PartialType(CreateCountyDto) {}
