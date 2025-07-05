import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { formatResponse } from 'src/types/types'

@Injectable()
export class ProductsService {
  create(createProductDto: CreateProductDto) {
    console.log(createProductDto)
    // TODO: Save to database
    return formatResponse('success', 'Product created successfully', null)
  }

  findAll() {
    // TODO: Fetch from database
    const products = [] // Replace with actual product list
    return formatResponse('success', 'All products retrieved', products)
  }

  findOne(id: string) {
    // TODO: Replace with DB query
    const product = null // Replace with actual product logic

    if (!product) {
      throw new NotFoundException(formatResponse('error', `Product with ID ${id} not found`, null))
    }

    return formatResponse('success', 'Product found', product)
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    // TODO: Update logic
    const updatedProduct = { id, ...updateProductDto } // Mock

    return formatResponse('success', 'Product updated successfully', updatedProduct)
  }

  remove(id: string) {
    // TODO: Delete logic
    return formatResponse('success', `Product with ID ${id} deleted`, null)
  }
}
