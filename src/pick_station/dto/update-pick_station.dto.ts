import { PartialType } from '@nestjs/swagger'
import { CreatePickStationDto } from './create-pick_station.dto'

export class UpdatePickStationDto extends PartialType(CreatePickStationDto) {}
