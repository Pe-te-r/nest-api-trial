import { Module } from '@nestjs/common';
import { SubCategoryService } from './sub_category.service';
import { SubCategoryController } from './sub_category.controller';

@Module({
  controllers: [SubCategoryController],
  providers: [SubCategoryService],
})
export class SubCategoryModule {}
