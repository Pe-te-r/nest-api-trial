import { IsEmail, IsString } from 'class-validator'

export class CreateAuthDto {
  @IsEmail()
  email: string

  @IsString()
  username: string

  @IsString()
  phone: string

  @IsString()
  password: string
}
