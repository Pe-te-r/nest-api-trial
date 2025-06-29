import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { DatabaseModule } from 'src/database/database.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { AuthSession } from './entities/auth.entity'

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User, AuthSession])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
