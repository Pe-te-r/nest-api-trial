import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateSubCategoryDto } from './dto/create-sub_category.dto'
import { UpdateSubCategoryDto } from './dto/update-sub_category.dto'
import { Category } from 'src/category/entities/category.entity'
import { SubCategory } from './entities/sub_category.entity'

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategory)
    private subCategoryRepo: Repository<SubCategory>,

    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(createSubCategoryDto: CreateSubCategoryDto) {
    const category = await this.categoryRepo.findOneBy({
      id: createSubCategoryDto.categoryId,
    })

    if (!category) throw new NotFoundException('Category not found')

    const subCategory = this.subCategoryRepo.create({
      name: createSubCategoryDto.name,
      category,
    })

    return this.subCategoryRepo.save(subCategory)
  }

  findAll() {
    return this.subCategoryRepo.find({ relations: ['category'] })
  }

  async findOne(id: string) {
    const sub = await this.subCategoryRepo.findOne({
      where: { id },
      relations: ['category'],
    })
    if (!sub) throw new NotFoundException(`Subcategory with ID ${id} not found`)
    return sub
  }

  async update(id: string, updateSubCategoryDto: UpdateSubCategoryDto) {
    const subCategory = await this.findOne(id)

    if (updateSubCategoryDto.categoryId) {
      const category = await this.categoryRepo.findOneBy({
        id: updateSubCategoryDto.categoryId,
      })
      if (!category) throw new NotFoundException('Category not found')
      subCategory.category = category
    }

    subCategory.name = updateSubCategoryDto.name || subCategory.name

    return this.subCategoryRepo.save(subCategory)
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.subCategoryRepo.delete(id)
  }
}
