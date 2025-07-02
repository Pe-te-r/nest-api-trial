import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { DatabaseModule } from 'src/database/database.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
