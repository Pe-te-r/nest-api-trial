import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { Order, OrderItem } from './entities/order.entity'
import { Customer } from '../customers/entities/customer.entity'
import { Store } from '../stores/entities/store.entity'
import { Product } from '../products/entities/product.entity'
import { User } from 'src/user/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Customer, Store, User, Product])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
