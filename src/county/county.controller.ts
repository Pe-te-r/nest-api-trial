import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { CountyService } from './county.service'
import { CreateCountyDto } from './dto/create-county.dto'
import { UpdateCountyDto } from './dto/update-county.dto'
import { Public } from 'src/common/decorators/public.decorator'
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'

@ApiTags('County')
@Controller('county')
export class CountyController {
  constructor(private readonly countyService: CountyService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new county' })
  create(@Body() createCountyDto: CreateCountyDto) {
    return this.countyService.create(createCountyDto)
  }

  @Get()
  @Public()
  @ApiQuery({
    name: 'constituency',
    required: false,
    type: Boolean,
    description: 'Include constituencies in the result (default: false)',
    example: false,
  })
  @ApiOperation({ summary: 'Get a list of all counties' })
  findAll(@Query('constituency') constituency: string) {
    const includeConstituency = constituency === 'true'
    return this.countyService.findAll(includeConstituency)
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a specific county by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the county to retrieve',
    example: 'e7a1f7cc-6f5f-48e5-bd57-7e8b52d34bb9',
  })
  @ApiQuery({
    name: 'constituency',
    required: false,
    type: Boolean,
    description: 'Include constituencies in the result (default: false)',
    example: false,
  })
  findOne(@Param('id') id: string, @Query('constituency') constituency: string) {
    const includeConstituency = constituency === 'true'
    return this.countyService.findOne(id, includeConstituency)
  }

  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a county by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the county to update',
    example: 'e7a1f7cc-6f5f-48e5-bd57-7e8b52d34bb9',
  })
  update(@Param('id') id: string, @Body() updateCountyDto: UpdateCountyDto) {
    return this.countyService.update(id, updateCountyDto)
  }

  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a county by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the county to delete',
    example: 'e7a1f7cc-6f5f-48e5-bd57-7e8b52d34bb9',
  })
  remove(@Param('id') id: string) {
    return this.countyService.remove(id)
  }
}
