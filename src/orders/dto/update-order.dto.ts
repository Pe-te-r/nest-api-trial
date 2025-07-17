import { PartialType } from '@nestjs/swagger'
import { CreateOrderDto } from './create-order.dto'
import { IsEnum } from 'class-validator'
import { OrderStatus } from 'src/types/types'

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

export class UpdateOrderItemDto {
  @IsEnum(OrderStatus)
  itemStatus: OrderStatus
}