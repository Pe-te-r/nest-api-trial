import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { TokenExpiredError } from 'jsonwebtoken'

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    console.log('[AtGuard] Request context:', context.getType())
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      console.log('[AtGuard] Public route - skipping guard')
      return true
    }

    console.log('[AtGuard] Protected route, checking token...')
    return super.canActivate(context)
  }

  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    console.log('[AtGuard] handleRequest error:', err)
    console.log('[AtGuard] handleRequest info:', info)
    console.log('[AtGuard] handleRequest user:', user)

    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException('ACCESS_TOKEN_EXPIRED')
      }
      throw new UnauthorizedException('INVALID_ACCESS_TOKEN')
    }

    return user
  }
}
