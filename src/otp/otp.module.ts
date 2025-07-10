import { Module } from '@nestjs/common'
import { OtpService } from './otp.service'
import { TwoFactorController } from './otp.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [TwoFactorController],
  providers: [OtpService],
})
export class OtpModule {}
