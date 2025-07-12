import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator'

export class UpdateStoreDto {
  @IsUUID()
  @IsOptional()
  userId?: string

  @IsString()
  @IsOptional()
  businessName?: string

  @IsString()
  @IsOptional()
  businessDescription?: string

  @IsString()
  @IsOptional()
  businessType?: string

  @IsString()
  @IsOptional()
  businessContact?: string

  @IsString()
  @IsOptional()
  streetAddress?: string

  @IsUUID()
  @IsOptional()
  constituencyId?: string

  @IsBoolean()
  @IsOptional()
  termsAccepted?: boolean
}
