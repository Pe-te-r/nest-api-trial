import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString, IsUUID, ArrayMinSize } from 'class-validator'

export class CreateMultipleSubCategoriesDto {
  @ApiProperty({
    description: 'Array of subcategory names to create',
    type: [String],
    example: ['Citrus', 'Berries', 'Tropical'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  names: string[]

  @ApiProperty({
    description: 'UUID of the parent category',
    type: 'string',
    example: 'a1234567-89ab-cdef-0123-456789abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string
}
