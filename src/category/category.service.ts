import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Category } from './entities/category.entity'
import { Repository } from 'typeorm'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create(dto)
    return this.categoryRepo.save(category)
  }

  async findAll(includeSub = false) {
    return this.categoryRepo.find({
      relations: includeSub ? ['subcategories'] : [],
    })
  }

  async findOne(id: string, includeSub = false) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: includeSub ? ['subcategories'] : [],
    })

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    return category
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.preload({
      id,
      ...dto,
    })

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    return this.categoryRepo.save(category)
  }

  async remove(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } })

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    return this.categoryRepo.remove(category)
  }
}
