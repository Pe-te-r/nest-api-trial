import { PartialType } from '@nestjs/mapped-types'
import { CreateAuthDto } from './create-auth.dto'
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CodeReason } from 'src/types/types'

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

export class CodeDto {
  @ApiProperty({
    description: 'Get otp code',
    type: 'string',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsEnum(CodeReason)
  reason: CodeReason
}

export class verifyDto {
  @ApiProperty({
    description: 'Verify otp code',
    type: 'string',
  })
  @IsString()
  code: string
}
