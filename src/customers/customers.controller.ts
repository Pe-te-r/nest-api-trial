import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { CustomersService } from './customers.service'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { Public } from 'src/common/decorators/public.decorator'

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto)
  }

  @Get()
  findAll() {
    return this.customersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id)
  }

  @Get(':id/orders')
  findOrders(@Param('id') id: string) {
    return this.customersService.findOrders(id)
  }

  @Get('admin/dashboard')
  @Public()
  getAdminDetailsDasboardStat() {
    return this.customersService.getAdminDashboardStat()
     }

  @Get(':id/dashboard')
  @Public()
  findDashboardStat(@Param('id') id: string) {
    return this.customersService.findDashboardStat(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(+id, updateCustomerDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(+id)
  }
}
