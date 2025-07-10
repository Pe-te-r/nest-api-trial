import { Body, Controller, Get, Post } from '@nestjs/common'
import { UserD } from 'src/common/decorators/user.decorator'
import { OtpService } from './otp.service'

@Controller('2fa')
export class TwoFactorController {
  constructor(private readonly otpService: OtpService) {}

  @Get('setup')
  async setup(@UserD('sub') id: string) {
    return this.otpService.createTotp(id)
  }

  @Post('verify')
  async verify(@UserD('sub') id: string, @Body('totp') totp: string) {
    return this.otpService.verifyTotp(id, totp)
  }
}
