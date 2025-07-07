import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Category } from './entities/category.entity'
import { Repository } from 'typeorm'
import { CreateCategoryDto } from './dto/create-category.dto'
import { formatResponse } from 'src/types/types'
import { SubCategory } from 'src/sub_category/entities/sub_category.entity'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create(dto)
    const savedCategory = await this.categoryRepo.save(category)
    return formatResponse('success', `category created id:${savedCategory.id}`, null)
  }

  async findAll(includeSub = false) {
    const categories = await this.categoryRepo.find({
      relations: includeSub ? ['subcategories'] : [],
    })
    return formatResponse('success', 'categories retrived', categories)
  }

  async findOne(id: string, includeSub = false) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: includeSub ? ['subcategories'] : [],
    })

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    return formatResponse('success', 'category retrived', category)
  }
  async findOneSUb(id: string) {
    const category = await this.categoryRepo.find({ where: { id: id } })
    if (!category) throw new NotFoundException(`this category not found id:${id}`)
    const all_sub = await this.subCategoryRepo.find({ where: { category } })
    if (!all_sub) throw new NotFoundException(`no subcategory found`)
    return formatResponse('success', 'all subcategories', all_sub)
  }

  async update(id: string, dto: CreateCategoryDto) {
    const category = await this.categoryRepo.findOne({ where: { id: id } })

    if (!category) {
      throw new NotFoundException('Category not found')
    }
    category.name = dto?.name
    await this.categoryRepo.save(category)
    return formatResponse('success', 'category updated', null)
  }

  async remove(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } })

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    await this.categoryRepo.remove(category)
    return formatResponse('success', 'category deleted', null)
  }
}
