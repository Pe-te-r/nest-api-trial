import { Type } from "class-transformer";
import { IsArray, IsEnum, IsString, ValidateNested } from "class-validator";
import { OrderStatus } from "src/types/types";

export class CreateAssignmentDto {
    @IsString()
    orderItemId: string;

    @IsEnum(OrderStatus)
    status: OrderStatus;
    
}

export class CreateAssignmentsArrayDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAssignmentDto)
    assignments: CreateAssignmentDto[];
}
