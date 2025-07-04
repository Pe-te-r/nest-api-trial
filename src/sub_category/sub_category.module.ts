import { Module } from '@nestjs/common'
import { SubCategoryService } from './sub_category.service'
import { SubCategoryController } from './sub_category.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubCategory } from './entities/sub_category.entity'
import { Category } from 'src/category/entities/category.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SubCategory, Category])],
  controllers: [SubCategoryController],
  providers: [SubCategoryService],
})
export class SubCategoryModule {}
