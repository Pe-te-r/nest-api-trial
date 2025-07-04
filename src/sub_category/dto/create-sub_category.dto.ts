import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class CreateSubCategoryDto {
  @ApiProperty({
    description: 'Name of the subcategory',
    type: 'string',
    example: 'Citrus',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'UUID of the parent category',
    type: 'string',
    example: 'a1234567-89ab-cdef-0123-456789abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string
}
