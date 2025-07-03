import { Injectable } from '@nestjs/common'
import { CreateCountyDto } from './dto/create-county.dto'
import { UpdateCountyDto } from './dto/update-county.dto'

@Injectable()
export class CountyService {
  create(createCountyDto: CreateCountyDto) {
    return 'This action adds a new county'
  }

  findAll() {
    return `This action returns all county`
  }

  findOne(id: number) {
    return `This action returns a #${id} county`
  }

  update(id: number, updateCountyDto: UpdateCountyDto) {
    return `This action updates a #${id} county`
  }

  remove(id: number) {
    return `This action removes a #${id} county`
  }
}
