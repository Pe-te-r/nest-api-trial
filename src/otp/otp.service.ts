// src/auth/otp.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import speakeasy from 'speakeasy'
import { formatResponse } from 'src/types/types'
import { User } from 'src/user/entities/user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class OtpService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}
  private generateSecret() {
    const totpCode = speakeasy.generateSecret({ length: 24 })
    return totpCode
  }
  async createTotp(id: string) {
    const foundSessionUser = await this.userRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        session: true,
      },
    })
    if (!foundSessionUser) throw new NotFoundException('This user is not available')
    const totp_code = this.generateSecret()
    foundSessionUser.session.otp_code = totp_code.base32
    await this.userRepository.manager.save(foundSessionUser.session)
    return formatResponse('success', 'Otp ready for setup', { secret: totp_code.base32 })
  }

  async verifyTotp(id: string, code: string) {
    console.log('code sent', code)
    const foundUser = await this.userRepository.findOne({
      where: { id },
      relations: { session: true },
    })

    if (!foundUser || !foundUser.session?.otp_code) {
      throw new NotFoundException('User or OTP not found')
    }
    console.log('foundUser', foundUser)
    const verified = speakeasy.totp.verify({
      secret: foundUser.session.otp_code,
      encoding: 'base32',
      token: code,
      window: 1,
    })
    console.log('found verified', verified)
    if (verified && !foundUser.session.otp_enabled) {
      foundUser.session.otp_enabled = true
      await this.userRepository.manager.save(foundUser.session)
    }

    return formatResponse(
      verified ? 'success' : 'error',
      verified ? 'OTP verified successfully' : 'Invalid or expired OTP',
      { verified },
    )
  }

  async disable(id: string) {
    const foundUser = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        session: true,
      },
    })
    if (!foundUser) throw new NotFoundException('user not found')
    console.log(foundUser)
    if (foundUser.session.otp_enabled) foundUser.session.otp_enabled = false
    await this.userRepository.manager.save(foundUser.session)
    return formatResponse('success', 'TOTP disbled success', null)
  }
}
