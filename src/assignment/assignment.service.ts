import { Injectable } from '@nestjs/common'
import { CreateAssignmentDto, CreateAssignmentsArrayDto } from './dto/create-assignment.dto'
import { UpdateAssignmentDto, UpdateAssignmentsArrayDto } from './dto/update-assignment.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Assignment } from './entities/assignment.entity'
import { Repository } from 'typeorm'
import { Order, OrderItem } from 'src/orders/entities/order.entity'
import { AssignmentStatus, OrderStatus } from 'src/types/types'

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment) private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
  ) {}
  create(createAssignmentDto: CreateAssignmentsArrayDto) {
    return 'This action adds a new assignment'
  }

  findAll() {
    return `This action returns all assignment`
  }

  findOne(id: number) {
    return `This action returns a #${id} assignment`
  }

  private updateRandomCode(orderItem: OrderItem[]){
    const randomCode = Math.random().toString(36).substring(2, 15);
    console.log('randomCode', randomCode);
    orderItem.forEach(item => {
      item.randomCode = randomCode;
    });
    return orderItem;
  }
async update(id: string, updateAssignmentsArrayDto: UpdateAssignmentsArrayDto) {
  // Process each assignment in parallel
  await Promise.all(
    updateAssignmentsArrayDto.assignments.map(async (updateDto) => {
      await this.processSingleAssignment(id, updateDto);
    })
  );
}

private async processSingleAssignment(assignmentId: string, updateDto: UpdateAssignmentDto) {
  const orderItem = await this.orderItemRepository.findOne({ 
    where: { id: updateDto.orderItemId } 
  });

  if (!orderItem) {
    throw new Error(`OrderItem with ID ${updateDto.orderItemId} not found`);
  }

  if (updateDto.status !== undefined) {
    // Update order item status
    orderItem.itemStatus = updateDto.status;
    await this.orderItemRepository.save(orderItem);

    const assignment = await this.assignmentRepository.findOne({ 
      where: { id: assignmentId } 
    });

    if (!assignment) {
      throw new Error(`Assignment with ID ${assignmentId} not found`);
    }

    // Check all order items in this assignment
    const orderItems = await this.orderItemRepository.find({ 
      where: { assignment: { id: assignmentId } } 
    });

    const hasSameStatus = orderItems.every(
      item => item.itemStatus === updateDto.status
    );

    if (hasSameStatus) {
      // Update assignment status based on order status
      switch (updateDto.status) {
        case OrderStatus.PENDING:
          assignment.status = AssignmentStatus.ACCEPTED;
          break;
        case OrderStatus.REJECTED:
          assignment.status = AssignmentStatus.REJECTED;
          break;
        case OrderStatus.DELIVERED:
        case OrderStatus.COMPLETED:
          assignment.status = AssignmentStatus.COMPLETED;
          break;
      }

      // Update codes if needed
      const newCodeOrderItems = this.updateRandomCode(orderItems);
      await this.orderItemRepository.save(newCodeOrderItems);
      await this.assignmentRepository.save(assignment);
    }
  }
}



  remove(id: string) {
    return `This action removes a #${id} assignment`
  }
}
