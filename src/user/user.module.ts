import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { DatabaseModule } from 'src/database/database.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { AuthModule } from 'src/auth/auth.module'
import { Product } from 'src/products/entities/product.entity'
import { Store } from 'src/stores/entities/store.entity'
import { Order } from 'src/orders/entities/order.entity'
import { Driver } from 'src/driver/entities/driver.entity'
import { Assignment } from 'src/assignment/entities/assignment.entity'

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User, Product, Store, Order, Driver, Assignment]), AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
