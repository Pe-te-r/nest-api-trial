import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Constituency } from './entities/constituency.entity'
import { Repository } from 'typeorm'
import { CreateMultipleConstituenciesDto } from './dto/create-constituency.dto'
import { UpdateConstituencyDto } from './dto/update-constituency.dto'
import { County } from 'src/county/entities/county.entity'
import { formatResponse } from 'src/types/types'

@Injectable()
export class ConstituencyService {
  constructor(
    @InjectRepository(Constituency)
    private readonly constituencyRepository: Repository<Constituency>,
    @InjectRepository(County)
    private readonly countyRepo: Repository<County>,

    @InjectRepository(County)
    private readonly countyRepository: Repository<County>,
  ) {}

  async createMultiple(createDto: CreateMultipleConstituenciesDto) {
    // 1. Find the county
    const county = await this.countyRepo.findOne({
      where: { id: createDto.county_id },
    })

    if (!county) {
      throw new NotFoundException(`County with id: ${createDto.county_id} not found`)
    }

    // 2. Create constituency entities
    const constituenciesToCreate = createDto.constituencies.map((name: string) => {
      return this.constituencyRepository.create({ name, county })
    })

    // 3. Save all constituencies at once
    await this.constituencyRepository.save(constituenciesToCreate)

    return formatResponse('success', 'Constituencies created successfully', null)
  }

  async findAll(county_name: string) {
    const county = await this.countyRepository.findOne({
      where: { county_name: county_name },
    })
    if (!county) throw new NotFoundException('No information found')
    const constituencies = await this.constituencyRepository.find({ where: { county } })
    if (!constituencies) throw new NotFoundException('No data foundS')
    const constituencies_json: { id: string; name: string }[] = []
    constituencies.forEach((constituency) =>
      constituencies_json.push({ id: constituency.id, name: constituency.name }),
    )
    console.log(constituencies_json)
    return formatResponse('success', 'Retrival was success', constituencies_json)
  }

  async findOne(id: string) {
    const constituency = await this.constituencyRepository.findOne({
      where: { id },
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
