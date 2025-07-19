import { Module } from '@nestjs/common'
import { DriverService } from './driver.service'
import { DriverController } from './driver.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Driver } from './entities/driver.entity'
import { Assignment } from 'src/assignment/entities/assignment.entity'
import { OrderItem } from 'src/orders/entities/order.entity'
import { User } from 'src/user/entities/user.entity'

@Module({
    imports:[TypeOrmModule.forFeature([Driver, Assignment, OrderItem, User])],
    controllers: [DriverController],
    providers: [DriverService],
  })
export class DriverModule {}
