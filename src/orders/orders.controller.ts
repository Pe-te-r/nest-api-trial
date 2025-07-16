import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { Public } from 'src/common/decorators/public.decorator'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    console.log('Creating order with DTO:', createOrderDto)
    return this.ordersService.create(createOrderDto)
  }

  @Get()
  findAll() {
    return this.ordersService.findAll()
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id)
  }
}
