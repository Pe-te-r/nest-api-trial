import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { SubCategoryService } from './sub_category.service'
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger'
import { CreateMultipleSubCategoriesDto as CreateDt } from './dto/create-sub_category.dto'
import { UpdateSubCategoryDto } from './dto/update-sub_category.dto'

@ApiTags('SubCategory')
@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new subcategory' })
  create(@Body() dto: CreateDt) {
    return this.subCategoryService.createMultiple(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all subcategories' })
  @ApiQuery({
    name: 'category',
    required: false,
    type: Boolean,
    description: 'Include category details for each subcategory (default: false)',
    example: false,
  })
  findAll(@Query('category') category: string) {
    const includeCategory = category === 'true'
    return this.subCategoryService.findAll(includeCategory)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subcategory by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the subcategory',
    example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: Boolean,
    description: 'Include category details for the subcategory (default: false)',
    example: false,
  })
  findOne(@Param('id') id: string, @Query('category') category: string) {
    const includeCategory = category === 'true'
    return this.subCategoryService.findOne(id, includeCategory)
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a subcategory by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateSubCategoryDto) {
    return this.subCategoryService.update(id, dto)
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a subcategory by ID' })
  remove(@Param('id') id: string) {
    return this.subCategoryService.remove(id)
  }
}
