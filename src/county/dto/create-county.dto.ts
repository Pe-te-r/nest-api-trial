import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'

export class CreateCountyDto {
  @IsNotEmpty()
  @IsString()
  county_code: string

  @IsNotEmpty()
  @IsString()
  county_name: string

  @IsOptional()
  @IsString()
  @Length(1, 10)
  county_initials?: string
}
