import { Module } from '@nestjs/common'
import { CustomersService } from './customers.service'
import { CustomersController } from './customers.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Customer } from './entities/customer.entity'
import { User } from 'src/user/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Customer, User])],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
