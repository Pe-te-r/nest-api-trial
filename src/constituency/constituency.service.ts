import { Injectable } from '@nestjs/common'
import { CreateConstituencyDto } from './dto/create-constituency.dto'
import { UpdateConstituencyDto } from './dto/update-constituency.dto'

@Injectable()
export class ConstituencyService {
  create(createConstituencyDto: CreateConstituencyDto) {
    return 'This action adds a new constituency'
  }

  findAll() {
    return `This action returns all constituency`
  }

  findOne(id: number) {
    return `This action returns a #${id} constituency`
  }

  update(id: number, updateConstituencyDto: UpdateConstituencyDto) {
    return `This action updates a #${id} constituency`
  }

  remove(id: number) {
    return `This action removes a #${id} constituency`
  }
}
