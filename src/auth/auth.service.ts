import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { Repository } from 'typeorm'
import { ApiResponse, CodeReason, formatResponse, LoginDataT, payload } from 'src/types/types'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthSession } from './entities/auth.entity'
import { UserRole } from 'src/utils/enums'
import { ResertDto } from './dto/update-auth.dto'
import { MailService } from 'src/mail/mail.service'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(AuthSession) private sessionRepository: Repository<AuthSession>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}
  private checkEmailExits = async (email: string): Promise<User | null> => {
    return await this.userRepository.findOne({ where: { email: email } })
  }

  private hashData = async (data: string): Promise<string> => {
    const saltRounds = 10
    const hash: string = await bcrypt.hash(data, saltRounds)
    return hash
  }

  private verifyData = async (unhashed: string, hashed: string): Promise<boolean> => {
    const isMatch: boolean = await bcrypt.compare(unhashed, hashed)
    return isMatch
  }

  private async getTokens(userId: string, email: string, role: UserRole = UserRole.CUSTOMER) {
    const payload = { sub: userId, email, role }

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      }),
    ])

    return {
      accessToken: at,
      refreshToken: rt,
    }
  }
  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  private phone_exits(phone: string) {
    return this.userRepository.findOne({ where: { phone } })
  }

  // save session method
  private async saveSession(userId: string, token: string) {
    const hashed_token = await this.hashData(token)
    const session = this.sessionRepository.create({
      refresh_token: hashed_token,
      user: { id: userId },
      ip_address: 'Unknown',
      random_code: this.generateSixDigitCode(),
      last_login: new Date(),
    })
    await this.sessionRepository.save(session)
  }

  // register method
  async register(createAuthDto: CreateAuthDto): Promise<ApiResponse<null>> {
    if (await this.checkEmailExits(createAuthDto.email)) {
      console.log('here')
      throw new ConflictException(`Email: ${createAuthDto.email} already exits `)
    }
    if (await this.phone_exits(createAuthDto.phone)) {
      throw new ConflictException(`Phone number: ${createAuthDto.phone} already exits `)
    }
    const hashedPassword = await this.hashData(createAuthDto.password)
    createAuthDto.password = hashedPassword
    console.log('data sent', createAuthDto)
    const user = this.userRepository.create({
      first_name: createAuthDto.firstName,
      last_name: createAuthDto.lastName,
      password_hash: createAuthDto.password,
      email: createAuthDto.email,
      phone: createAuthDto.phone,
    })
    await this.userRepository.save(user)
    await this.mailService.sendUserRegistration(createAuthDto.firstName, createAuthDto.email)

    return formatResponse('success', 'User created success', null)
  }

  // login method
  async Login(updateAuthDto: LoginAuthDto): Promise<ApiResponse<LoginDataT>> {
    if (updateAuthDto.email && updateAuthDto.password) {
      // check if user exits
      const foundUser = await this.checkEmailExits(updateAuthDto?.email)
      if (!foundUser) {
        throw new NotFoundException(`Email: ${updateAuthDto.email} does not exits `)
      }
      // password valid check
      if (!(await this.verifyData(updateAuthDto?.password, foundUser.password_hash))) {
        throw new UnauthorizedException('Invalid credentials')
      }
      // generate token
      const { accessToken, refreshToken } = await this.getTokens(
        foundUser.id,
        foundUser.email,
        foundUser.role,
      )
      await this.saveSession(foundUser.id, refreshToken)
      const loginData: LoginDataT = {
        tokens: {
          accessToken,
          refreshToken,
        },
        user: {
          id: foundUser.id,
          email: foundUser.email,
          role: foundUser.role,
        },
      }
      return formatResponse<LoginDataT>('success', 'Login was success', loginData)
    } else {
      throw new BadRequestException('Email is required')
    }
  }

  async refreshToken(id: string, token: string, payload: payload) {
    if (id !== payload?.sub) {
      throw new UnauthorizedException('Mismatched token subject and user ID')
    }

    // fetch user
    const userSession = await this.sessionRepository.findOne({ where: { userId: id } })
    if (!userSession || !userSession?.refresh_token) {
      throw new UnauthorizedException('User not found or no session')
    }
    const tokenMatch = await this.verifyData(token, userSession.refresh_token)
    if (!tokenMatch) {
      throw new UnauthorizedException('Refresh token is invalid')
    }
    const { accessToken } = await this.getTokens(payload.sub, payload.email, payload.role)
    console.log('new access token')
    return formatResponse<string>('success', 'New access token issued', accessToken)
  }

  async resetPassword(id: string, data: ResertDto) {
    const user = await this.userRepository.findOne({ where: { id: id } })
    if (!user) {
      throw new NotFoundException(`user with ${id} not found`)
    }
    if (await this.verifyData(data.oldPassword, user.password_hash)) {
      user.password_hash = await this.hashData(data.newPassword)
      await this.userRepository.save(user)
      await this.mailService.updatePassword(user.email, user.first_name)
      return formatResponse('success', 'User data retrived success', null)
    } else {
      throw new UnauthorizedException('Invalid old password')
    }
  }

  private getReasonMessage(reason: CodeReason): string {
    const reasonMessages: Record<CodeReason, string> = {
      [CodeReason.REGISTRATION]: 'Complete your registration with groceryStore',
      [CodeReason.PASSWORD_RESET]: 'Reset your groceryStore account password',
      [CodeReason.EMAIL_VERIFICATION]: 'Verify your email address',
      [CodeReason.TWO_FACTOR_AUTH]: 'Two-factor authentication login',
      [CodeReason.ACCOUNT_RECOVERY]: 'Recover your groceryStore account',
      [CodeReason.SECURITY_ALERT]: 'Security verification for your account',
    }
    return reasonMessages[reason]
  }

  async getCode(email: string, reason: CodeReason) {
    const user_exits = await this.userRepository.findOne({
      where: { email },
      relations: { session: true },
    })
    console.log('one')
    if (!user_exits) throw new NotFoundException('User not found')
    console.log('two')

    const session = user_exits?.session
    if (session) {
      const random_code = this.generateSixDigitCode()
      console.log('three')
      const reasonMessage = this.getReasonMessage(reason)
      console.log('this is the code', random_code)
      console.log('four')
      session.random_code = random_code
      await this.sessionRepository.save(session)
      await this.mailService.sendCode(
        user_exits.email,
        user_exits.first_name,
        session.random_code,
        reasonMessage,
      )
      return formatResponse('success', 'Checkout your email code sent', null)
    }
    return formatResponse('error', 'You need to contact admin', null)
  }
  async verifyCode(code: string, id: string) {
    const user_exits = await this.userRepository.findOne({
      where: { id },
      relations: { session: true },
    })
    const session = user_exits?.session
    if (session?.random_code !== code) {
      return formatResponse('error', 'Wrong code', null)
    }
    return formatResponse('success', 'Code verified', null)
  }
}
