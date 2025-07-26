import { PartialType } from '@nestjs/swagger'
import { CreateAssignmentDto, CreateAssignmentsArrayDto } from './create-assignment.dto'
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {}

export class UpdateAssignmentsArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAssignmentDto)
  assignments: UpdateAssignmentDto[];
}