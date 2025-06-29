import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto } from './dto/create-auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto)
  }
  @Post('login')
  async login(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.Login(createAuthDto)
  }
}
