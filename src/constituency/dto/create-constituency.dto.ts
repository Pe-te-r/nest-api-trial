// src/constituency/dto/create-multiple-constituencies.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString, IsUUID, ArrayMinSize } from 'class-validator'

export class CreateMultipleConstituenciesDto {
  @ApiProperty({
    description: 'Array of constituency names to create',
    type: [String],
    example: ['Nairobi West', 'Nairobi East', 'Nairobi North'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  constituencies: string[]

  @ApiProperty({
    description: 'UUID of the county',
    type: 'string',
    example: 'a1234567-89ab-cdef-0123-456789abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  county_id: string
}
