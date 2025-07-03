import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { County } from './entities/county.entity'
import { CreateCountyDto } from './dto/create-county.dto'
import { UpdateCountyDto } from './dto/update-county.dto'

@Injectable()
export class CountyService {
  constructor(
    @InjectRepository(County)
    private readonly countyRepository: Repository<County>,
  ) {}

  async create(createCountyDto: CreateCountyDto) {
    const county = this.countyRepository.create(createCountyDto)
    return await this.countyRepository.save(county)
  }

  async findAll() {
    return await this.countyRepository.find({
      relations: ['constituencies'], // Include constituencies if needed
    })
  }

  async findOne(id: string) {
    const county = await this.countyRepository.findOne({
      where: { id },
      relations: ['constituencies'],
    })
    if (!county) throw new NotFoundException(`County #${id} not found`)
    return county
  }

  async update(id: string, updateCountyDto: UpdateCountyDto) {
    const county = await this.countyRepository.preload({
      id,
      ...updateCountyDto,
    })
    if (!county) throw new NotFoundException(`County #${id} not found`)
    return await this.countyRepository.save(county)
  }

  async remove(id: string) {
    const county = await this.countyRepository.findOneBy({ id })
    if (!county) throw new NotFoundException(`County #${id} not found`)
    return await this.countyRepository.remove(county)
  }
}
