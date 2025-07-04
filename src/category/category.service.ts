import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from './entities/category.entity'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepo.create(createCategoryDto)
    return this.categoryRepo.save(category)
  }

  findAll() {
    return this.categoryRepo.find({ relations: ['subcategories'] })
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['subcategories'],
    })
    if (!category) throw new NotFoundException(`Category with ID ${id} not found`)
    return category
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id) // to ensure it exists
    await this.categoryRepo.update(id, updateCategoryDto)
    return this.findOne(id)
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.categoryRepo.delete(id)
  }
}
