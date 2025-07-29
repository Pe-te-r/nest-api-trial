import { PartialType } from '@nestjs/swagger'
import { CreatePickStationDto } from './create-pick_station.dto'

export class UpdatePickStationDto extends PartialType(CreatePickStationDto) {}
// src/order-items/dto/update-order-item.dto.ts
import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { OrderStatus } from 'src/types/types'
import { Type } from 'class-transformer'

export class UpdateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  itemId: string

  @IsEnum(OrderStatus)
  status: OrderStatus
}
export class UpdateOrderItemsStatusDto {


  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items: UpdateOrderItemDto[]
}