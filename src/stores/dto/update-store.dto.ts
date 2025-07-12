import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateStoreDto {
  @IsBoolean()
  @IsOptional()
  approved?: boolean
}
