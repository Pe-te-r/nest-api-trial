import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { UserRole } from 'src/user/entities/user.entity'

export type JWTPayload = {
  sub: number
  email: string
  role: UserRole
}

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configServices: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configServices.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
    })
  }

  validate(payload: JWTPayload) {
    try {
      console.log('[AtStrategy] Validated payload:', payload)
      return payload
    } catch (e) {
      console.error('[AtStrategy] Error in validate():', e)
      throw e
    }
  }
}
