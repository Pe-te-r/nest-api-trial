import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { ConstituencyService } from './constituency.service'
import { CreateConstituencyDto } from './dto/create-constituency.dto'
import { UpdateConstituencyDto } from './dto/update-constituency.dto'

@Controller('constituency')
export class ConstituencyController {
  constructor(private readonly constituencyService: ConstituencyService) {}

  @Post()
  create(@Body() createConstituencyDto: CreateConstituencyDto) {
    return this.constituencyService.create(createConstituencyDto)
  }

  @Get()
  findAll() {
    return this.constituencyService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constituencyService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConstituencyDto: UpdateConstituencyDto) {
    return this.constituencyService.update(+id, updateConstituencyDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.constituencyService.remove(+id)
  }
}
