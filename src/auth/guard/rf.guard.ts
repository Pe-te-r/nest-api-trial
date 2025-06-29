// rt.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
@Injectable()
export class RtGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super()
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }

  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    if (err || !user) {
      console.log('error', info)
      if (info === 'TokenExpiredError') {
        throw new UnauthorizedException('REFRESH_TOKEN_EXPIRED')
      }
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN')
    }

    return user
  }
}
