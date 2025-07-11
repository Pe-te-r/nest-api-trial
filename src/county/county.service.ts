import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { County } from './entities/county.entity'
import { CreateCountyDto } from './dto/create-county.dto'
import { UpdateCountyDto } from './dto/update-county.dto'
import { formatResponse } from 'src/types/types'

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

  async findAll(includeConstituency: boolean) {
    if (includeConstituency) {
      return await this.countyRepository.find({
        relations: ['constituencies'],
      })
    }
    const counties = await this.countyRepository.find()
    return formatResponse('success', 'All counties retrived', counties)
  }

  async findOne(id: string, includeConstituency: boolean) {
    if (includeConstituency) {
      const county = await this.countyRepository.findOne({
        where: { id },
        relations: ['constituencies'],
      })
      if (!county) throw new NotFoundException(`County #${id} not found`)
      return county
    }
    const county = await this.countyRepository.findOne({
      where: { id },
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
