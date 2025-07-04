import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID, IsString } from 'class-validator'

export class CreateConstituencyDto {
  @ApiProperty({
    description: 'Name of the constituency',
    type: 'string',
    example: 'Langata',
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    description: 'UUID of the county the constituency belongs to',
    type: 'string',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsNotEmpty()
  @IsUUID()
  countyId: string
}
