/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from 'src/utils/enums'
import { JWTPayload } from '../strategy'
import { ROLES_KEY } from 'src/common/decorators/role.decorator'

export interface UserRequest extends Request {
  user?: JWTPayload
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) {
      return true
    }
    const { user } = context.switchToHttp().getRequest<UserRequest>()
    user?.role
    if (!user) {
      return false
    }

    return requiredRoles.some((role) => user.role?.includes(role))
  }
}
