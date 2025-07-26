import { Module } from '@nestjs/common'
import { AssignmentService } from './assignment.service'
import { AssignmentController } from './assignment.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrderItem } from 'src/orders/entities/order.entity'
import { Assignment } from './entities/assignment.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, OrderItem])],
  controllers: [AssignmentController],
  providers: [AssignmentService],
})
export class AssignmentModule {}
