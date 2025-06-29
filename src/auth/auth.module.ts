import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { DatabaseModule } from 'src/database/database.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { AuthSession } from './entities/auth.entity'
import { JwtModule } from '@nestjs/jwt'
import { AtStrategy } from './strategy/ac.strategy'

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([User, AuthSession]),
    JwtModule.register({ global: true }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy],
})
export class AuthModule {}
