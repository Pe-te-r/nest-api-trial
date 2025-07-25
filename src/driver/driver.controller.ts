import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { DriverService } from './driver.service'
import { CreateDriverDto } from './dto/create-driver.dto'
import { UpdateDriverDto } from './dto/update-driver.dto'
import { Public } from 'src/common/decorators/public.decorator'
import { AssignmentStatus } from 'src/types/types'

@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driverService.create(createDriverDto)
  }

  @Public()
  @Get()
  findAll() {
    return this.driverService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driverService.findOne(id)
  }

  @Get(':id/orders')
  @Public()
  findDriverOrders(@Param('id') id: string, @Param('status') status?: AssignmentStatus) {
    return this.driverService.findDriverOrders(id, status)
  }

  // driver dashboard
  @Get('dashboard/:id')
  findDriverDashboard(@Param('id') id: string) {
    return this.driverService.findDriverDashboard(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driverService.update(id, updateDriverDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driverService.remove(id)
  }
}
