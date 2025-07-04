import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'

export class CreateCountyDto {
  @ApiProperty({
    description: 'Code of the county',
    type: 'string',
    example: '047',
  })
  @IsNotEmpty()
  @IsString()
  county_code: string

  @ApiProperty({
    description: 'Name of the county',
    type: 'string',
    example: 'Nairobi',
  })
  @IsNotEmpty()
  @IsString()
  county_name: string

  @ApiProperty({
    description: 'Short initials of the county (optional)',
    type: 'string',
    example: 'NRB',
    required: false,
    minLength: 1,
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  county_initials?: string
}
