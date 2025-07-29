import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { PickStationService } from './pick_station.service'
import { CreatePickStationDto } from './dto/create-pick_station.dto'
import { UpdateOrderItemDto, UpdateOrderItemsStatusDto, UpdatePickStationDto } from './dto/update-pick_station.dto'
import { Public } from 'src/common/decorators/public.decorator'

@Controller('pickup-stations')
export class PickStationController {
  constructor(private readonly pickStationService: PickStationService) {}

  @Post()
  create(@Body() createPickStationDto: CreatePickStationDto) {
    return this.pickStationService.create(createPickStationDto)
  }

  @Get()
  findAll() {
    return this.pickStationService.findAll()
  }

  @Patch('items/:id/status')
  updateItemStatus(@Param('id') orderId:string,@Body() updateOrderItems:UpdateOrderItemDto[]){
    console.log('updateOrderItems',updateOrderItems)
    return this.pickStationService.updateItemsStatus(orderId,updateOrderItems)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pickStationService.findOne(id)
  }

  @Get(':id/county')
  findByCounty(@Param('id') id: string) {
    return this.pickStationService.findByCounty(id)
  }

  @Get(':id/dashboard')
  @Public()
  findDashboardStat(@Param('id') id:string){
    return this.pickStationService.dashboardStat(id)
  }
  @Get(':id/orders')
  @Public()
  findOrderDetails(@Param('id') id:string){
    return this.pickStationService.getOrderDetailsForPickupStation(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePickStationDto: UpdatePickStationDto) {
    return this.pickStationService.update(id, updatePickStationDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pickStationService.remove(id)
  }
}
