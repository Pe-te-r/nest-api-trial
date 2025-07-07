import { PartialType } from '@nestjs/mapped-types'
import { CreateMultipleSubCategoriesDto } from './create-sub_category.dto'

export class UpdateSubCategoryDto extends PartialType(CreateMultipleSubCategoriesDto) {}
