import { IsString, IsNumber, IsBoolean, IsNotEmpty, IsOptional, IsUrl } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  createdBy: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsNumber()
  @Type(() => Number)
  price: number

  @IsNumber()
  @Type(() => Number)
  stock: number

  @IsString()
  @IsOptional()
  description: string

  @IsBoolean()
  @Type(() => Boolean)
  isAvailable: boolean

  @IsString()
  @IsNotEmpty()
  category: string

  @IsString()
  @IsNotEmpty()
  subCategory: string

  @IsOptional()
  @IsUrl()
  imageUrl?: string

  @IsOptional()
  @IsString()
  image?: string // data:image/jpeg;base64,...

  // Helper method to check if it's a base64 image
  isBase64Image() {
    return this.image?.startsWith('data:image')
  }
}
