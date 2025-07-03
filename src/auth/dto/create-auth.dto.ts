import { IsEmail, IsOptional, IsString } from 'class-validator'

export class CreateAuthDto {
  @IsEmail()
  email: string

  @IsString()
  firstName: string

  @IsOptional()
  @IsString()
  lastName: string

  @IsString()
  phone: string

  @IsString()
  password: string
}
