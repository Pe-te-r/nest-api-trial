import { PartialType } from '@nestjs/mapped-types'
import { CreateProductDto } from './create-product.dto'
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateProductDto extends PartialType(CreateProductDto) {}

// create-subcategory.dto.ts
export class CreateSubCategoryDto {
  @IsString()
  name: string

  @IsNotEmpty()
  categoryId: string // Reference to the parent category
}

// create-multiple-subcategories.dto.ts
export class CreateMultipleSubCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubCategoryDto)
  subCategories: CreateSubCategoryDto[]
}
