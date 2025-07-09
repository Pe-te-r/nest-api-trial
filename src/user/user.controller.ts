import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { allUserQuery, userIdQueryType } from 'src/types/types'
import { Public } from 'src/common/decorators/public.decorator'
// import { Public } from 'src/common/decorators/public.decorator'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Public()
  @Get()
  findAll(@Query() query: allUserQuery) {
    return this.userService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: userIdQueryType) {
    console.log('query', query)
    return this.userService.findOne(id, query)
  }
  @Get(':id/products')
  findProducts(@Param('id') id: string) {
    return this.userService.findProducts(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id)
  }
}
