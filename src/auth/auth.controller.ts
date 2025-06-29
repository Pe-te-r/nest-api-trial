import { Controller, Post, Body, Get, UseGuards, Param, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto } from './dto/create-auth.dto'
import { Public } from 'src/common/decorators/public.decorator'
import { RtGuard } from './guard/rf.guard'
import { Request } from 'express'
import { payload } from 'src/types/types'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto)
  }

  @Public()
  @Post('login')
  async login(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.Login(createAuthDto)
  }

  @Public()
  @UseGuards(RtGuard)
  @Get('refresh/:id')
  async refresh(@Param('id') id: string, @Req() req: Request) {
    const payload = req?.user as payload
    const token = req.headers.authorization?.replace('Bearer ', '') || ''
    return this.authService.refreshToken(id, token, payload)
  }
}
