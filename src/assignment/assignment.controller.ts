import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { AssignmentService } from './assignment.service'
import {  CreateAssignmentsArrayDto } from './dto/create-assignment.dto'
import {  UpdateAssignmentsArrayDto } from './dto/update-assignment.dto'

@Controller('assignment')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  create(@Body() createAssignmentDto: CreateAssignmentsArrayDto) {
    return this.assignmentService.create(createAssignmentDto)
  }

  @Get()
  findAll() {
    return this.assignmentService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentService.findOne(+id)
  }

  @Patch(':id/order-items')
  update(@Param('id') id: string, @Body() updateAssignmentDto: UpdateAssignmentsArrayDto) {
    console.log('updateAssignmentDto', updateAssignmentDto)
    return this.assignmentService.update(id, updateAssignmentDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assignmentService.remove(id)
  }
}
