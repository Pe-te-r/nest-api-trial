/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CreateAuthDto } from './dto/create-auth.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User, UserRole } from 'src/user/entities/user.entity'
import { Repository } from 'typeorm'
import { ApiResponse, formatResponse, LoginDataT } from 'src/types/types'
import { UpdateAuthDto } from './dto/update-auth.dto'
import { NotFoundError } from 'rxjs'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  async register(createAuthDto: CreateAuthDto): Promise<ApiResponse<null>> {
    if (await this.checkEmailExits(createAuthDto.email)) {
      throw new ConflictException(`Email: ${createAuthDto.email} already exits `)
    }
    const hashedPassword = await this.hashData(createAuthDto.password)
    const user = this.userRepository.create({
      username: createAuthDto.username,
      email: createAuthDto.email,
      password_hash: hashedPassword,
      phone: createAuthDto.phone,
    })
    await this.userRepository.save(user)

    return formatResponse('success', 'User created success', null)
  }

  async Login(updateAuthDto: UpdateAuthDto): Promise<ApiResponse<LoginDataT>> {
    if (updateAuthDto.email && updateAuthDto.password) {
      // check if user exits
      const foundUser = await this.checkEmailExits(updateAuthDto?.email)
      if (!foundUser) {
        throw new NotFoundError(`Email: ${updateAuthDto.email} does not exits `)
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
      const loginData: LoginDataT = {
        tokens: {
          accessToken,
          refreshToken,
        },
        user: {
          id: foundUser.id,
          email: foundUser.email,
        },
      }
      return formatResponse<LoginDataT>('success', 'Login was success', loginData)
    } else {
      throw new BadRequestException('Email is required')
    }
  }
}
