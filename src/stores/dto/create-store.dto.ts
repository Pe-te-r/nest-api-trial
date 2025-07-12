import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class CreateStoreDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  businessName: string

  @IsString()
  businessDescription: string

  @IsString()
  @IsNotEmpty()
  businessType: string

  @IsString()
  @IsNotEmpty()
  businessContact: string

  @IsString()
  @IsNotEmpty()
  streetAddress: string

  @IsUUID()
  @IsNotEmpty()
  constituencyId: string

  @IsBoolean()
  termsAccepted: boolean
}
