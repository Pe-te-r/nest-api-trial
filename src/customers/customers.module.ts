import { Module } from '@nestjs/common'
import { CustomersService } from './customers.service'
import { CustomersController } from './customers.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Customer } from './entities/customer.entity'
import { User } from 'src/user/entities/user.entity'
import { Order, OrderItem } from 'src/orders/entities/order.entity'
import { AuthSession } from 'src/auth/entities/auth.entity'
import { Assignment } from 'src/assignment/entities/assignment.entity'
import { Product } from 'src/products/entities/product.entity'
import { Constituency } from 'src/constituency/entities/constituency.entity'
import { County } from 'src/county/entities/county.entity'
import { Driver } from 'src/driver/entities/driver.entity'
import { Store } from 'src/stores/entities/store.entity'
import { Category } from 'src/category/entities/category.entity'
import { SubCategory } from 'src/sub_category/entities/sub_category.entity'
import { PickStation } from 'src/pick_station/entities/pick_station.entity'

@Module({
  // Importing the necessary repositories for the CustomersService
  imports: [TypeOrmModule.forFeature([Customer, User, Order, AuthSession, OrderItem, Assignment, OrderItem, Product,Constituency,County,Driver,Store,Category,SubCategory,PickStation ])],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
