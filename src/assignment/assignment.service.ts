import { Injectable } from '@nestjs/common'
import { CreateAssignmentDto } from './dto/create-assignment.dto'
import { UpdateAssignmentDto } from './dto/update-assignment.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Assignment } from './entities/assignment.entity'
import { Repository } from 'typeorm'
import { Order, OrderItem } from 'src/orders/entities/order.entity'
import { OrderStatus } from 'src/types/types'

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment) private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
  ) {}
  create(createAssignmentDto: CreateAssignmentDto) {
    return 'This action adds a new assignment'
  }

  findAll() {
    return `This action returns all assignment`
  }

  findOne(id: number) {
    return `This action returns a #${id} assignment`
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto) {
   const orderItem = await this.orderItemRepository.findOne({ where: { id: updateAssignmentDto.orderItemId } });
   if (!orderItem) {
      throw new Error(`OrderItem with ID ${updateAssignmentDto.orderItemId} not found`);
    }
    orderItem.itemStatus = OrderStatus.DELIVERED

  }
  

  remove(id: string) {
    return `This action removes a #${id} assignment`
  }
}
