import { PartialType } from '@nestjs/mapped-types';
import { CreateSubCategoryDto } from './create-sub_category.dto';

export class UpdateSubCategoryDto extends PartialType(CreateSubCategoryDto) {}
