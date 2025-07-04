import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Public } from 'src/common/decorators/public.decorator'
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto)
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({
    name: 'sub',
    required: false,
    type: Boolean,
    description: 'Include subcategories in the result (default: false)',
    example: false,
  })
  findAll(@Query('sub') sub: string) {
    const includeSub = sub === 'true'
    return this.categoryService.findAll(includeSub)
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'UUID of the category',
    example: '52df8bb3-1a8f-4c4d-97b3-48a5b6f2e1b6',
  })
  @ApiQuery({
    name: 'sub',
    required: false,
    type: Boolean,
    description: 'Include subcategories in the result (default: false)',
    example: false,
  })
  findOne(@Param('id') id: string, @Query('sub') sub: string) {
    const includeSub = sub === 'true'
    return this.categoryService.findOne(id, includeSub)
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a category by ID' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto)
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a category by ID' })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id)
  }
}
