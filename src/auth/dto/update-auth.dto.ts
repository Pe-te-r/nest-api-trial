import { PartialType } from '@nestjs/mapped-types'
import { CreateAuthDto } from './create-auth.dto'
import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}

export class ResertDto {
  @ApiProperty({
    description: 'Password for the user account',
    type: 'string',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string

  @ApiProperty({
    description: 'Password for the user account',
    type: 'string',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string
}
