/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConflictException, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CreateAuthDto } from './dto/create-auth.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { Repository } from 'typeorm'
import { ApiResponse, formatResponse } from 'src/types/types'

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}
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

  async register(createAuthDto: CreateAuthDto): Promise<ApiResponse<null>> {
    console.log(createAuthDto)
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

  async Login() {}
}
