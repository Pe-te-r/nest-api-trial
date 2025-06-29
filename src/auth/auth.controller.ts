import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto } from './dto/create-auth.dto'
import { Public } from 'src/common/decorators/public.decorator'

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
}
