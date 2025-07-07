import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { SubCategory } from './entities/sub_category.entity'
import { Repository } from 'typeorm'
import { CreateMultipleSubCategoriesDto } from './dto/create-sub_category.dto'
import { UpdateSubCategoryDto } from './dto/update-sub_category.dto'
import { formatResponse } from 'src/types/types'
import { Category } from 'src/category/entities/category.entity'

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
    @InjectRepository(Category)
    private readonly CategoryRepo: Repository<Category>,
  ) {}

  async findAll(includeCategory = false) {
    const subcategories = await this.subCategoryRepo.find({
      relations: includeCategory ? ['category'] : [],
    })
    return formatResponse('success', 'subcategories', subcategories)
  }

  async createMultiple(createDto: CreateMultipleSubCategoriesDto) {
    // 1. Find the parent category - should use categoryRepo, not subCategoryRepo
    const category = await this.CategoryRepo.findOne({
      where: { id: createDto.categoryId },
    })

    if (!category) {
      throw new NotFoundException(`Category with id: ${createDto.categoryId} not found`)
    }

    // 2. Create subcategory entities
    const subCategoriesToCreate = createDto.names.map((name) => {
      return this.subCategoryRepo.create({
        name,
        category: category,
      })
    })

    // 3. Save all subcategories at once
    await this.subCategoryRepo.save(subCategoriesToCreate)

    return formatResponse('success', 'Subcategories created successfully', 'null')
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
