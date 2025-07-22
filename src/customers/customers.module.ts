import { Module } from '@nestjs/common'
import { CustomersService } from './customers.service'
import { CustomersController } from './customers.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Customer } from './entities/customer.entity'
import { User } from 'src/user/entities/user.entity'
import { Order } from 'src/orders/entities/order.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Customer, User, Order])],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
