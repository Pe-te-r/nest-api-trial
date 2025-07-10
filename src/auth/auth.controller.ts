import { Controller, Post, Body, Get, UseGuards, Param, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto'
import { Public } from 'src/common/decorators/public.decorator'
import { RtGuard } from './guard/rf.guard'
import { Request } from 'express'
import { payload } from 'src/types/types'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CodeDto, ResertDto, verifyDto } from './dto/update-auth.dto'
import { UserD } from 'src/common/decorators/user.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @ApiOperation({ summary: 'Register Endpoints' })
  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto)
  }

  @Public()
  @ApiOperation({ summary: 'Login with email and username' })
  @Post('login')
  async login(@Body() createAuthDto: LoginAuthDto) {
    return this.authService.Login(createAuthDto)
  }

  @Public()
  @ApiOperation({ summary: 'Refresh access token with userId' })
  @UseGuards(RtGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('refresh/:id')
  async refresh(@Param('id') id: string, @Req() req: Request) {
    const payload = req?.user as payload
    const token = req.headers.authorization?.replace('Bearer ', '') || ''
    return this.authService.refreshToken(id, token, payload)
  }

  @ApiOperation({ summary: 'Login with email and username' })
  @Post('reset-password/:id')
  async resetPassword(@Param('id') id: string, @Body() createAuthDto: ResertDto) {
    return this.authService.resetPassword(id, createAuthDto)
  }

  @ApiOperation({ summary: 'Get code' })
  @Post('code')
  async getCode(@Body() createAuthDto: CodeDto) {
    console.log('code', createAuthDto)
    return this.authService.getCode(createAuthDto.email, createAuthDto.reason)
  }

  @ApiOperation({ summary: 'Get code' })
  @Post('code/verify')
  async verifyCode(@Body() createAuthDto: verifyDto, @UserD('sub') userId: string) {
    console.log('code', createAuthDto)
    return this.authService.verifyCode(createAuthDto.code, userId)
  }
}
