import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateStoreDto } from './dto/create-store.dto'
import { UpdateStoreDto } from './dto/update-store.dto'
import { Store } from './entities/store.entity'
import { User } from 'src/user/entities/user.entity'
import { Constituency } from 'src/constituency/entities/constituency.entity'
import { formatResponse } from 'src/types/types'

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Constituency)
    private readonly constituencyRepository: Repository<Constituency>,
  ) {}

  async create(createStoreDto: CreateStoreDto) {
    console.log('data received', createStoreDto)
    // Verify user exists
    const user = await this.userRepository.findOneBy({ id: createStoreDto.userId })
    if (!user) {
      throw new NotFoundException(`User with ID ${createStoreDto.userId} not found`)
    }

    // Verify constituency exists
    const constituency = await this.constituencyRepository.findOneBy({
      id: createStoreDto.constituencyId,
    })
    if (!constituency) {
      throw new NotFoundException(`Constituency with ID ${createStoreDto.constituencyId} not found`)
    }

    // Create new store
    const store = this.storeRepository.create({
      ...createStoreDto,
      user,
      constituency,
    })

    await this.storeRepository.save(store)
    return formatResponse('success', 'Store created success wait for review', null)
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find({
      relations: ['user', 'constituency', 'constituency.county'],
    })
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['user', 'constituency', 'constituency.county'],
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`)
    }

    return store
  }
  async checkIfApplied(id: string) {
    const user = await this.userRepository.findOne({ where: { id }, relations: { store: true } })
    if (!user) throw new NotFoundException('These user not found')
    const store = user.store
    return formatResponse('success', 'Applied already available', store.approved)
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.storeRepository.preload({
      id,
      ...updateStoreDto,
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`)
    }

    // If updating constituency
    if (updateStoreDto.constituencyId) {
      const constituency = await this.constituencyRepository.findOneBy({
        id: updateStoreDto.constituencyId,
      })
      if (!constituency) {
        throw new NotFoundException(
          `Constituency with ID ${updateStoreDto.constituencyId} not found`,
        )
      }
      store.constituency = constituency
    }

    return this.storeRepository.save(store)
  }

  async remove(id: string): Promise<void> {
    const result = await this.storeRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`Store with ID ${id} not found`)
    }
  }
}
