import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { SubCategory } from './entities/sub_category.entity'
import { Repository } from 'typeorm'
import { CreateSubCategoryDto } from './dto/create-sub_category.dto'
import { UpdateSubCategoryDto } from './dto/update-sub_category.dto'

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
  ) {}

  async create(dto: CreateSubCategoryDto) {
    const sub = this.subCategoryRepo.create(dto)
    return this.subCategoryRepo.save(sub)
  }

  async findAll(includeCategory = false) {
    return this.subCategoryRepo.find({
      relations: includeCategory ? ['category'] : [],
    })
  }

  async findOne(id: string, includeCategory = false) {
    const sub = await this.subCategoryRepo.findOne({
      where: { id },
      relations: includeCategory ? ['category'] : [],
    })

    if (!sub) {
      throw new NotFoundException(`Subcategory with ID ${id} not found`)
    }

    return sub
  }

  async update(id: string, dto: UpdateSubCategoryDto) {
    const sub = await this.subCategoryRepo.findOne({ where: { id } })
    if (!sub) throw new NotFoundException(`Subcategory with ID ${id} not found`)

    const updated = Object.assign(sub, dto)
    return this.subCategoryRepo.save(updated)
  }

  async remove(id: string) {
    const sub = await this.subCategoryRepo.findOne({ where: { id } })
    if (!sub) throw new NotFoundException(`Subcategory with ID ${id} not found`)

    return this.subCategoryRepo.remove(sub)
  }
}
