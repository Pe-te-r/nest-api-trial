/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserRequest } from 'src/auth/guard/roles.guard'

export const UserD = createParamDecorator((data: keyof any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<UserRequest>()
  return data ? request.user?.[data] : request.user
})
