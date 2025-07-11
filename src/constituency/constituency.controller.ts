import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { ConstituencyService } from './constituency.service'
import { CreateConstituencyDto } from './dto/create-constituency.dto'
import { UpdateConstituencyDto } from './dto/update-constituency.dto'
import { Public } from 'src/common/decorators/public.decorator'
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('Constituency')
@Controller('constituency')
export class ConstituencyController {
  constructor(private readonly constituencyService: ConstituencyService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new constituency' })
  create(@Body() createConstituencyDto: CreateConstituencyDto) {
    return this.constituencyService.create(createConstituencyDto)
  }

  @Get()
  @Public()
  @ApiQuery({ name: 'county', required: false, type: Boolean })
  @ApiOperation({ summary: 'Get a list of all constituencies' })
  findAll(@Query('county') county: string) {
    console.log('count', county)
    return this.constituencyService.findAll(county)
  }

  @Get(':id')
  @Public()
  @ApiQuery({ name: 'county', required: false, type: Boolean })
  @ApiOperation({ summary: 'Get a constituency by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the constituency to retrieve',
    type: 'string',
    example: 'f2ab0d47-06ee-4f8d-b0e5-d303b5a145e1',
  })
  findOne(@Param('id') id: string) {
    return this.constituencyService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a constituency by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'UUID of the constituency to update',
    type: 'string',
    example: 'f2ab0d47-06ee-4f8d-b0e5-d303b5a145e1',
  })
  update(@Param('id') id: string, @Body() updateConstituencyDto: UpdateConstituencyDto) {
    return this.constituencyService.update(id, updateConstituencyDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a constituency by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'UUID of the constituency to delete',
    type: 'string',
    example: 'f2ab0d47-06ee-4f8d-b0e5-d303b5a145e1',
  })
  remove(@Param('id') id: string) {
    return this.constituencyService.remove(id)
  }
}
