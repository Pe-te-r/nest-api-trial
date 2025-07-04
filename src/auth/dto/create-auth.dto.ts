import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, IsNotEmpty } from 'class-validator'

export class CreateAuthDto {
  @ApiProperty({
    description: 'Valid email address of the user',
    type: 'string',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'First name of the user',
    type: 'string',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({
    description: 'Last name of the user (optional)',
    type: 'string',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string

  @ApiProperty({
    description: 'Phone number of the user',
    type: 'string',
    example: '+254712345678',
  })
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiProperty({
    description: 'Password for the user account',
    type: 'string',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string
}

export class LoginAuthDto {
  @ApiProperty({
    description: 'Valid email address of the user',
    type: 'string',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Password for the user account',
    type: 'string',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string
}
