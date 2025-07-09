import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { DatabaseModule } from 'src/database/database.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { AuthSession } from './entities/auth.entity'
import { JwtModule } from '@nestjs/jwt'
import { AtStrategy } from './strategy/ac.strategy'
import { AtGuard } from './guard/ac.guard'
import { RtGuard } from './guard/rf.guard'
import { RTStrategy } from './strategy'
import { MailModule } from 'src/mail/mail.module'

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([User, AuthSession]),
    JwtModule.register({ global: true }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, AtGuard, RtGuard, RTStrategy],
  exports: [AuthService],
})
export class AuthModule {}
