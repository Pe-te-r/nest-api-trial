// update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator'
import { UserRole } from 'src/utils/enums'

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

  // role update enum for useRole
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}
