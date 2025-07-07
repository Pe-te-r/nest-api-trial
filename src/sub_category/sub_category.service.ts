import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { SubCategory } from './entities/sub_category.entity'
import { Repository } from 'typeorm'
import { CreateSubCategoryDto } from './dto/create-sub_category.dto'
import { UpdateSubCategoryDto } from './dto/update-sub_category.dto'
import { formatResponse } from 'src/types/types'

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
  ) {}

  async create(dto: CreateSubCategoryDto) {
    const sub = this.subCategoryRepo.create(dto)
    await this.subCategoryRepo.save(sub)
    return formatResponse('success', `subcategory saved with id:${sub.id}`, null)
  }

  async findAll(includeCategory = false) {
    const subcategories = await this.subCategoryRepo.find({
      relations: includeCategory ? ['category'] : [],
    })
    return formatResponse('success', 'subcategories', subcategories)
  }

  async createMultiple(subCategories: CreateSubCategoryDto[]) {
    const createdSubCategories = subCategories.map((subCategory) =>
      this.subCategoryRepo.create(subCategory),
    )

    return this.subCategoryRepo.save(createdSubCategories)
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
