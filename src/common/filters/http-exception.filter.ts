/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const message =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error'

    // ✅ Log everything about the exception for debugging
    console.error('Exception thrown:', exception)

    // If it’s an object with a stack trace, log that too
    if (exception instanceof Error) {
      console.error('Stack trace:', exception.stack)
    }

    response.status(status).json({
      status: 'error',
      message: typeof message === 'string' ? message : (message as any)?.message,
      data: null,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
