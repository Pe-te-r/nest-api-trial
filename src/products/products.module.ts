import { Module } from '@nestjs/common'
import { ProductsService } from './products.service'
import { ProductsController } from './products.controller'
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from './entities/product.entity'
import { SubCategory } from 'src/sub_category/entities/sub_category.entity'
import { User } from 'src/user/entities/user.entity'

@Module({
  imports: [CloudinaryModule, TypeOrmModule.forFeature([Product, User, SubCategory])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
