import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { CountyService } from './county.service'
import { CreateCountyDto } from './dto/create-county.dto'
import { UpdateCountyDto } from './dto/update-county.dto'

@Controller('county')
export class CountyController {
  constructor(private readonly countyService: CountyService) {}

  @Post()
  create(@Body() createCountyDto: CreateCountyDto) {
    return this.countyService.create(createCountyDto)
  }

  @Get()
  findAll() {
    return this.countyService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countyService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCountyDto: UpdateCountyDto) {
    return this.countyService.update(+id, updateCountyDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.countyService.remove(+id)
  }
}
