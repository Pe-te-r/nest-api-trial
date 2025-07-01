import { IsEmail, IsOptional, IsString } from 'class-validator'

export class CreateAuthDto {
  @IsEmail()
  email: string

  @IsString()
  first_name: string

  @IsOptional()
  @IsString()
  last_name: string

  @IsString()
  phone: string

  @IsString()
  password: string
}
