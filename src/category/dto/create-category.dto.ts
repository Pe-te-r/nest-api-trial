import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    type: 'string',
    example: 'Fruits',
  })
  @IsString()
  @IsNotEmpty()
  name: string
}
