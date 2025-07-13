import { Injectable } from '@nestjs/common'
import { CreatePickStationDto } from './dto/create-pick_station.dto'
import { UpdatePickStationDto } from './dto/update-pick_station.dto'

@Injectable()
export class PickStationService {
  create(createPickStationDto: CreatePickStationDto) {
    return 'This action adds a new pickStation'
  }

  findAll() {
    return `This action returns all pickStation`
  }

  findOne(id: number) {
    return `This action returns a #${id} pickStation`
  }

  update(id: number, updatePickStationDto: UpdatePickStationDto) {
    return `This action updates a #${id} pickStation`
  }

  remove(id: number) {
    return `This action removes a #${id} pickStation`
  }
}
