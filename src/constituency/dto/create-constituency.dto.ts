import { IsNotEmpty, IsUUID, IsString } from 'class-validator'

export class CreateConstituencyDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsUUID()
  countyId: string
}
