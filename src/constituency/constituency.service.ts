import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Constituency } from './entities/constituency.entity'
import { Repository } from 'typeorm'
import { CreateConstituencyDto } from './dto/create-constituency.dto'
import { UpdateConstituencyDto } from './dto/update-constituency.dto'
import { County } from 'src/county/entities/county.entity'

@Injectable()
export class ConstituencyService {
  constructor(
    @InjectRepository(Constituency)
    private readonly constituencyRepository: Repository<Constituency>,

    @InjectRepository(County)
    private readonly countyRepository: Repository<County>,
  ) {}

  async create(createConstituencyDto: CreateConstituencyDto) {
    const county = await this.countyRepository.findOne({
      where: { id: createConstituencyDto.countyId },
    })

    if (!county) {
      throw new NotFoundException('County not found')
    }

    const newConstituency = this.constituencyRepository.create({
      name: createConstituencyDto.name,
      county,
    })

    return this.constituencyRepository.save(newConstituency)
  }

  async findAll(includeCounty = false) {
    return this.constituencyRepository.find({
      relations: includeCounty ? ['county'] : [],
    })
  }

  async findOne(id: string, includeCounty = false) {
    const constituency = await this.constituencyRepository.findOne({
      where: { id },
      relations: includeCounty ? ['county'] : [],
    })

    if (!constituency) {
      throw new NotFoundException('Constituency not found')
    }

    return constituency
  }

  async update(id: string, updateDto: UpdateConstituencyDto) {
    const constituency = await this.constituencyRepository.findOne({
      where: { id },
    })

    if (!constituency) {
      throw new NotFoundException('Constituency not found')
    }

    // If county is updated
    if (updateDto.countyId) {
      const county = await this.countyRepository.findOne({
        where: { id: updateDto.countyId },
      })

      if (!county) {
        throw new NotFoundException('New county not found')
      }

      constituency.county = county
    }

    if (updateDto.name) {
      constituency.name = updateDto.name
    }

    return this.constituencyRepository.save(constituency)
  }

  async remove(id: string) {
    const constituency = await this.constituencyRepository.findOne({
      where: { id },
    })

    if (!constituency) {
      throw new NotFoundException('Constituency not found')
    }

    return this.constituencyRepository.remove(constituency)
  }
}
