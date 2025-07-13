import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { formatResponse } from 'src/types/types'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'
import { Readable } from 'typeorm/platform/PlatformTools.js'
import { InjectRepository } from '@nestjs/typeorm'
import { Product } from './entities/product.entity'
import { Repository } from 'typeorm'
import { SubCategory } from 'src/sub_category/entities/sub_category.entity'
import { User } from 'src/user/entities/user.entity'

@Injectable()
export class ProductsService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(SubCategory) private subCatRepository: Repository<SubCategory>,
  ) {}
  private base64ToBuffer(base64: string): { buffer: Buffer; originalname: string } {
    // Remove the data:image/...;base64, part
    const base64Data = base64.split(';base64,').pop() as string
    const buffer = Buffer.from(base64Data, 'base64')

    // Extract file extension from the base64 string
    const matches = base64.match(/^data:image\/([A-Za-z-+/]+);base64,/)
    const extension = matches ? matches[1] : 'jpg'

    return {
      buffer,
      originalname: `image.${extension}`,
    }
  }
  private async getUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id }, relations: { store: true } })
    if (!user) throw new NotFoundException(`user with id:${id} not found`)
    return user
  }

  private async getSubCate(id: string) {
    const subCategory = await this.subCatRepository.findOne({ where: { id } })
    if (!subCategory) throw new NotFoundException(`subcategory with id:${id} not found`)
    return subCategory
  }

  async create(createProductDto: CreateProductDto) {
    let imageUrl: string | undefined
    let publicId: string | undefined

    if (createProductDto.image?.startsWith('data:image')) {
      const { buffer, originalname } = this.base64ToBuffer(createProductDto.image)
      const mockStream = new Readable()
      mockStream.push(buffer)
      mockStream.push(null)
      const file: Express.Multer.File = {
        buffer,
        originalname,
        encoding: '7bit',
        mimetype: createProductDto.image.match(/^data:(.*?);/)?.[1] || 'image/jpeg',
        size: buffer.length,
        fieldname: 'image',
        destination: '',
        filename: originalname,
        path: '',
        stream: mockStream,
      }
      const uploadResult = await this.cloudinaryService.uploadImage(file)
      console.log(uploadResult)
      imageUrl = uploadResult.secure_url
      publicId = uploadResult.public_id
    } else {
      imageUrl = createProductDto.image
    }
    const user = await this.getUser(createProductDto.createdBy)
    const subCategory = await this.getSubCate(createProductDto.subCategory)
    const product = this.productRepository.create({
      imageUrl: imageUrl,
      description: createProductDto.description,
      isAvailable: createProductDto.isAvailable,
      name: createProductDto.name,
      stock: createProductDto.stock,
      price: createProductDto.price,
      store: user.store,
      subCategory: subCategory,
      public_id: publicId,
    })
    await this.productRepository.save(product)
    return formatResponse('success', 'Product created successfully', null)
  }

  async findAll() {
    const products = await this.productRepository.find()
    if (!products) throw new NotFoundException('no product found')
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
