// update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
import { IsOptional, IsString, IsEmail } from 'class-validator'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEmail()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsString()
  phone?: string
}
