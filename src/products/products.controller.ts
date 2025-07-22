import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger'
import { Public } from 'src/common/decorators/public.decorator'

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product successfully created' })
  create(@Body() createProductDto: CreateProductDto) {
    console.log('controller data', createProductDto)
    return this.productsService.create(createProductDto)
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of all products' })
  findAll(@Query('category') category?: string) {
    return this.productsService.findAll(category)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID or number of the product to retrieve',
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID or number of the product to update',
    example: '1',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product successfully updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID or number of the product to delete',
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Product successfully deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id)
  }
}
