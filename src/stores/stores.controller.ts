import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common'
import { StoresService } from './stores.service'
import { CreateStoreDto } from './dto/create-store.dto'
import { UpdateStoreDto } from './dto/update-store.dto'
import { Public } from 'src/common/decorators/public.decorator'

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto)
  }

  @Get()
  findAll() {
    return this.storesService.findAll()
  }
  @Get('admin')
  findForAdmin() {
    return this.storesService.findForAdmin()
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.findOne(id)
  }

  @Get(':id/dashboard')
  @Public()
  findStoreDashboardStats(@Param('id', ParseUUIDPipe) userId: string) {
    return this.storesService.findStoreDashboardStats(userId)
  }

  @Get(':id/orders')
  @Public()
  findOrders(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.findVendorOrders(id)
  }

  @Get(':id/applied')
  checkApplied(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.checkIfApplied(id)
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.remove(id)
  }
}
