import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreatePickStationDto } from './dto/create-pick_station.dto'
import { UpdatePickStationDto } from './dto/update-pick_station.dto'
import { PickStation } from './entities/pick_station.entity'
import { Constituency } from '../constituency/entities/constituency.entity'

@Injectable()
export class PickStationService {
  constructor(
    @InjectRepository(PickStation)
    private readonly pickStationRepository: Repository<PickStation>,
    @InjectRepository(Constituency)
    private readonly constituencyRepository: Repository<Constituency>,
  ) {}

  async create(createPickStationDto: CreatePickStationDto) {
    const constituency = await this.constituencyRepository.findOne({
      where: { id: createPickStationDto.constituencyId },
    })
    if (!constituency) throw new Error('Constituency not found')
    const pickStation = this.pickStationRepository.create({
      ...createPickStationDto,
      constituency,
    })
    return this.pickStationRepository.save(pickStation)
  }

  async findAll() {
    const stations = await this.pickStationRepository.find({
      relations: ['constituency', 'constituency.county'],
    })
    return stations.map((station) => {
      const { constituency, ...rest } = station
      const { county, ...constituencyData } = constituency
      return {
        ...rest,
        county,
        constituency: constituencyData,
      }
    })
  }

  findOne(id: string) {
    return this.pickStationRepository.findOne({
      where: { id },
      relations: ['constituency', 'orders'],
    })
  }

  findByCounty(countyId: string) {
    return this.pickStationRepository.find({
      where: { constituency: { county: { id: countyId } } },
      relations: ['constituency'],
    })
  }

  async update(id: string, updatePickStationDto: UpdatePickStationDto) {
    await this.pickStationRepository.update(id, updatePickStationDto)
    return this.findOne(id)
  }

  async remove(id: string) {
    await this.pickStationRepository.delete(id)
    return { deleted: true }
  }
}
